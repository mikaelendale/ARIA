<?php

namespace App\Ai\Tools;

use App\Ai\Support\RecordsAgentActions;
use App\Ai\Support\ToolJsonResponse;
use App\Models\Guest;
use App\Models\Incident;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class LogIncident implements Tool
{
    public const NAME = 'log_incident';

    public function __construct(
        protected RecordsAgentActions $actions,
    ) {}

    public function description(): Stringable|string
    {
        return 'Create an open incident record for tracking.';
    }

    public function handle(Request $request): Stringable|string
    {
        $type = (string) ($request['type'] ?? '');
        $description = (string) ($request['description'] ?? '');
        $severity = (string) ($request['severity'] ?? '');
        $guestIdRaw = $request['guest_id'] ?? null;

        if ($type === '' || $description === '' || $severity === '') {
            $this->actions->record(self::NAME, $request->all(), 'error', result: 'missing fields');

            return ToolJsonResponse::error('type, description, and severity are required.');
        }

        $resolvedGuestId = null;
        if (is_string($guestIdRaw) && $guestIdRaw !== '') {
            $resolvedGuestId = Guest::resolveFromAgentGuestId($guestIdRaw)?->id;
        }

        $incident = Incident::query()->create([
            'guest_id' => $resolvedGuestId,
            'type' => $type,
            'trigger_source' => 'manual',
            'severity' => $severity,
            'description' => $description,
            'context' => null,
            'status' => 'open',
        ]);

        $this->actions->record(
            self::NAME,
            $request->all(),
            'ok',
            result: $incident->id,
            guestId: $resolvedGuestId,
            incidentId: $incident->id,
        );

        return ToolJsonResponse::ok(['incident_id' => $incident->id]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'type' => $schema->string()->required(),
            'description' => $schema->string()->required(),
            'severity' => $schema->string()->required(),
            'guest_id' => $schema->string(),
        ];
    }
}
