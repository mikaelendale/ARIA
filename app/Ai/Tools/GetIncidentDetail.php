<?php

namespace App\Ai\Tools;

use App\Ai\Support\ToolJsonResponse;
use App\Models\Incident;
use App\Support\OpsData;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

/**
 * Read-only: single incident with description and related agent actions.
 */
class GetIncidentDetail implements Tool
{
    public const NAME = 'get_incident_detail';

    public function description(): Stringable|string
    {
        return 'Load one incident by UUID id. Returns description, status, severity, and agent actions linked to the incident.';
    }

    public function handle(Request $request): Stringable|string
    {
        $id = (string) ($request['incident_id'] ?? '');

        if ($id === '') {
            return ToolJsonResponse::error('incident_id is required.');
        }

        $incident = Incident::query()->find($id);
        if (! $incident) {
            return ToolJsonResponse::error('Incident not found.');
        }

        return ToolJsonResponse::ok([
            'incident' => OpsData::incidentDetail($incident),
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'incident_id' => $schema->string()->required(),
        ];
    }
}
