<?php

namespace App\Ai\Tools;

use App\Ai\Support\ToolJsonResponse;
use App\Models\Incident;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

/**
 * Read-only: list incidents (newest first).
 */
class ListIncidents implements Tool
{
    public const NAME = 'list_incidents';

    public function description(): Stringable|string
    {
        return 'List incidents with type, severity, status, created time. filter: open (not resolved), resolved, or all. Limit 1–120 (default 40).';
    }

    public function handle(Request $request): Stringable|string
    {
        $limit = (int) ($request['limit'] ?? 40);
        $limit = max(1, min(120, $limit));

        $filter = (string) ($request['status_filter'] ?? 'all');
        if (! in_array($filter, ['open', 'resolved', 'all'], true)) {
            $filter = 'all';
        }

        $query = Incident::query()->latest('created_at');

        if ($filter === 'open') {
            $query->where('status', '!=', 'resolved');
        } elseif ($filter === 'resolved') {
            $query->where('status', 'resolved');
        }

        $rows = $query
            ->limit($limit)
            ->get()
            ->map(fn (Incident $incident) => [
                'id' => $incident->id,
                'type' => $incident->type,
                'severity' => $incident->severity,
                'status' => $incident->status,
                'resolutionTime' => $incident->resolution_time_seconds ? $incident->resolution_time_seconds.'s' : null,
                'createdAt' => optional($incident->created_at)?->toIso8601String() ?? now()->toIso8601String(),
            ])
            ->values()
            ->all();

        return ToolJsonResponse::ok([
            'incidents' => $rows,
            'filter' => $filter,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'limit' => $schema->integer()->min(1)->max(120),
            'status_filter' => $schema->string()->enum(['open', 'resolved', 'all']),
        ];
    }
}
