<?php

namespace App\Ai;

use App\Ai\Agents\AriaOrchestrator;
use App\Ai\Support\RecordsAgentActions;
use App\Events\IncidentResolved;
use App\Models\Guest;
use App\Models\Incident;
use App\Models\Room;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Event;

class Orchestrator
{
    public function __construct(
        protected AriaOrchestrator $agent,
        protected AriaToolRegistry $toolRegistry,
        protected RecordsAgentActions $records,
    ) {}

    /**
     * @param  array{type?: string, payload?: array<string, mixed>}  $event
     * @return array{
     *     text: string,
     *     invocation_id: string,
     *     tool_calls: list<array<string, mixed>>,
     *     tool_results: list<array<string, mixed>>,
     *     usage: array<string, int>,
     *     guest_id: ?string,
     * }
     */
    public function handle(array $event): array
    {
        $type = (string) ($event['type'] ?? 'unknown');
        $payload = is_array($event['payload'] ?? null) ? $event['payload'] : [];
        $guestId = isset($payload['guest_id']) ? (string) $payload['guest_id'] : null;

        $userMessage = $this->buildContext($event);

        $response = $this->agent->prompt($userMessage);

        $toolNames = $response->toolCalls->map(fn ($c) => $c->name)->unique()->values()->all();

        if ($toolNames === []) {
            $this->records->record(
                'orchestration',
                array_merge(['event_type' => $type], $this->broadcastPayload($payload)),
                'ok',
                result: $response->text,
                guestId: $guestId,
            );
        }

        $resolveId = $payload['resolve_incident_id'] ?? null;
        if (is_string($resolveId) && $resolveId !== '') {
            $incident = Incident::query()->find($resolveId);
            Incident::query()->whereKey($resolveId)->update([
                'status' => 'resolved',
                'resolved_at' => now(),
            ]);

            $message = $incident
                ? "Incident {$resolveId} resolved ({$incident->type})."
                : "Incident {$resolveId} resolved.";

            Event::dispatch(new IncidentResolved(
                incidentId: $resolveId,
                message: $message,
            ));
        }

        return [
            'text' => $response->text,
            'invocation_id' => $response->invocationId,
            'tool_calls' => $response->toolCalls->map(fn ($c) => $c->toArray())->values()->all(),
            'tool_results' => $response->toolResults->map(fn ($r) => $r->toArray())->values()->all(),
            'usage' => $response->usage->toArray(),
            'guest_id' => $guestId,
        ];
    }

    /**
     * Manual tool invocation for replay or debugging (not used by handle()).
     *
     * @param  array<string, mixed>  $arguments
     */
    public function dispatchTool(string $name, array $arguments): string
    {
        return $this->toolRegistry->run($name, $arguments);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    protected function broadcastPayload(array $payload): array
    {
        return collect($payload)->except(['resolve_incident_id'])->all();
    }

    /**
     * @param  array{type?: string, payload?: array<string, mixed>}  $event
     */
    private function buildContext(array $event): string
    {
        $type = (string) ($event['type'] ?? 'unknown');
        $payload = is_array($event['payload'] ?? null) ? $event['payload'] : [];

        $now = Carbon::now(config('app.timezone'));
        $totalRooms = Room::query()->count();
        $occupied = Room::query()->where('is_occupied', true)->count();
        $occupancyPct = $totalRooms > 0 ? round(100 * $occupied / $totalRooms, 1) : 0.0;

        $restPayload = collect($payload)->except(['guest_id'])->all();
        $lines = [
            '# ARIA orchestrator context',
            '',
            '## Event',
            'Type: '.$type,
            'Other payload (excluding guest_id): '.json_encode($restPayload, JSON_THROW_ON_ERROR),
            '',
            '## Property snapshot',
            'Local time: '.$now->toIso8601String(),
            'Timezone: '.config('app.timezone'),
            'Day of week: '.$now->format('l'),
            sprintf('Occupancy: %s%% (%d of %d rooms marked occupied)', (string) $occupancyPct, $occupied, $totalRooms),
            '',
        ];

        $guestId = isset($payload['guest_id']) ? (string) $payload['guest_id'] : null;
        if ($guestId !== null && $guestId !== '') {
            $guest = Guest::query()->find($guestId);
            if ($guest) {
                $guest->load([
                    'incidents' => fn ($q) => $q->latest()->limit(5),
                    'agentActions' => fn ($q) => $q->latest()->limit(10),
                ]);

                $lines[] = '## Guest';
                $lines[] = '- Name: '.$guest->name;
                $lines[] = '- Phone: '.$guest->phone;
                $lines[] = '- Room number: '.($guest->room_number ?? 'none');
                $lines[] = '- VIP: '.($guest->is_vip ? 'yes' : 'no');
                $lines[] = '- Churn risk score: '.$guest->churn_risk_score;
                $lines[] = '- Language: '.$guest->language_preference;
                $lines[] = '- Preferences: '.json_encode($guest->preference_tags ?? [], JSON_THROW_ON_ERROR);
                $lines[] = '- Checked in: '.($guest->checked_in_at?->toIso8601String() ?? 'null');
                $lines[] = '- Checked out: '.($guest->checked_out_at?->toIso8601String() ?? 'null');
                $lines[] = '';

                if ($guest->room_number) {
                    $room = Room::query()->find($guest->room_number);
                    $lines[] = '## Guest room';
                    if ($room) {
                        $lines[] = '- Number: '.$room->number;
                        $lines[] = '- Type: '.$room->type;
                        $lines[] = '- Status: '.$room->status;
                        $lines[] = '- Current price: '.$room->current_price;
                        $lines[] = '- Occupied flag: '.($room->is_occupied ? 'yes' : 'no');
                    } else {
                        $lines[] = '- No matching room row for number '.$guest->room_number;
                    }
                    $lines[] = '';
                }

                $lines[] = '## Last 5 incidents (newest first)';
                foreach ($guest->incidents as $incident) {
                    $lines[] = sprintf(
                        '- [%s] %s — %s (%s)',
                        $incident->id,
                        $incident->type,
                        $incident->severity,
                        $incident->status
                    );
                }
                if ($guest->incidents->isEmpty()) {
                    $lines[] = '- None';
                }
                $lines[] = '';

                $lines[] = '## Last 10 agent actions (newest first)';
                foreach ($guest->agentActions as $action) {
                    $lines[] = sprintf(
                        '- [%s] %s — %s',
                        $action->id,
                        $action->tool_called,
                        $action->status
                    );
                }
                if ($guest->agentActions->isEmpty()) {
                    $lines[] = '- None';
                }
                $lines[] = '';
                $lines[] = '## Tool contract (critical)';
                $lines[] = 'For send_whatsapp, apply_discount, book_experience, and any tool that accepts guest_id, you MUST pass this exact UUID string — copy it verbatim, never use placeholders like "unknown" or the guest name:';
                $lines[] = $guestId;
                $lines[] = '';
            } else {
                $lines[] = '## Guest';
                $lines[] = 'guest_id was provided but no guest was found: '.$guestId;
                $lines[] = '';
            }
        }

        $lines[] = '## Instruction';
        $lines[] = 'Use the registered tools when needed. Summarize actions clearly for operations staff.';

        return implode("\n", $lines);
    }
}
