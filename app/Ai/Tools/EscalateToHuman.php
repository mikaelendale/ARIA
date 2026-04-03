<?php

namespace App\Ai\Tools;

use App\Ai\Support\RecordsAgentActions;
use App\Ai\Support\ToolJsonResponse;
use App\Models\Incident;
use App\Models\Staff;
use App\Services\TwilioService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;
use Throwable;

class EscalateToHuman implements Tool
{
    public const NAME = 'escalate_to_human';

    public function __construct(
        protected TwilioService $twilio,
        protected RecordsAgentActions $actions,
    ) {}

    public function description(): Stringable|string
    {
        return 'Hand off a situation to front-desk staff and optionally mark an incident escalated.';
    }

    public function handle(Request $request): Stringable|string
    {
        $reason = (string) ($request['reason'] ?? '');
        $incidentId = $request['incident_id'] ?? null;
        $guestId = $request['guest_id'] ?? null;

        if ($reason === '') {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'missing reason');

            return ToolJsonResponse::error('reason is required.');
        }

        $staff = Staff::query()
            ->where('department', 'reception')
            ->where('is_available', true)
            ->first();

        if (! $staff) {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'no reception staff');

            return ToolJsonResponse::error('No available reception staff found.');
        }

        $ctx = 'Escalation';
        if (is_string($guestId) && $guestId !== '') {
            $ctx .= " — guest {$guestId}";
        }
        if (is_string($incidentId) && $incidentId !== '') {
            $ctx .= " — incident {$incidentId}";
        }
        $body = "{$ctx}. Reason: {$reason}";

        try {
            $sid = $this->twilio->sendWhatsapp($staff->phone, $body);
        } catch (Throwable $e) {
            $this->actions->record(
                self::NAME,
                $request->all(),
                'error',
                result: $e->getMessage(),
                guestId: is_string($guestId) ? $guestId : null,
                incidentId: is_string($incidentId) ? $incidentId : null,
            );

            return ToolJsonResponse::error($e->getMessage());
        }

        if (is_string($incidentId) && $incidentId !== '') {
            Incident::query()->whereKey($incidentId)->update(['status' => 'escalated']);
        }

        $this->actions->record(
            self::NAME,
            $request->all(),
            'ok',
            result: $sid,
            guestId: is_string($guestId) ? $guestId : null,
            incidentId: is_string($incidentId) ? $incidentId : null,
        );

        return ToolJsonResponse::ok(['twilio_sid' => $sid, 'staff_id' => $staff->id]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'reason' => $schema->string()->required(),
            'incident_id' => $schema->string(),
            'guest_id' => $schema->string(),
        ];
    }
}
