<?php

namespace App\Ai\Tools;

use App\Ai\Support\ToolJsonResponse;
use App\Support\OpsData;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

/**
 * Read-only: high-level dashboard KPIs (matches {@see OpsData::dashboardPayload()} core metrics).
 */
class ReadDashboardSummary implements Tool
{
    public const NAME = 'read_dashboard_summary';

    public function description(): Stringable|string
    {
        return 'Read current resort snapshot: guest count, open incidents, resolved today, churn score, occupancy %, revenue impact today, pulse revenue today.';
    }

    public function handle(Request $request): Stringable|string
    {
        $payload = OpsData::dashboardPayload();

        $data = [
            'guests' => $payload['guests'],
            'incidentsOpen' => $payload['incidentsOpen'],
            'resolvedToday' => $payload['resolvedToday'],
            'churnScore' => $payload['churnScore'],
            'occupancyPercent' => $payload['occupancyPercent'],
            'revenueImpactToday' => $payload['revenueImpactToday'],
            'pulseRevenueToday' => $payload['pulseRevenueToday'],
            'initialRevenueImpact' => $payload['initialRevenueImpact'],
        ];

        $includeQueue = filter_var($request['include_queue'] ?? true, FILTER_VALIDATE_BOOLEAN);
        if ($includeQueue) {
            $data['queueSnapshot'] = $payload['queueSnapshot'];
        }

        return ToolJsonResponse::ok(['dashboard' => $data]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'include_queue' => $schema->boolean(),
        ];
    }
}
