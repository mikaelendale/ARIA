<?php

namespace App\Ai\Tools;

use App\Ai\Support\ToolJsonResponse;
use App\Models\Guest;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

/**
 * Read-only: list guests (summary rows), optionally filtered by name search.
 */
class ListGuests implements Tool
{
    public const NAME = 'list_guests';

    public function description(): Stringable|string
    {
        return 'List guests with room, churn score, VIP flag, last interaction. Optional search matches name (contains, case-insensitive). Limit 1–80 (default 40).';
    }

    public function handle(Request $request): Stringable|string
    {
        $limit = (int) ($request['limit'] ?? 40);
        $limit = max(1, min(80, $limit));

        $search = $request['search'] ?? null;
        $search = is_string($search) ? trim($search) : '';

        $query = Guest::query()->orderByDesc('churn_risk_score');

        if ($search !== '') {
            $query->where('name', 'like', '%'.$search.'%');
        }

        $rows = $query
            ->limit($limit)
            ->get()
            ->map(fn (Guest $guest) => [
                'id' => $guest->id,
                'name' => $guest->name,
                'room' => (string) $guest->room_number,
                'churnScore' => (int) $guest->churn_risk_score,
                'vip' => (bool) $guest->is_vip,
                'lastInteraction' => optional($guest->last_interaction_at)?->toIso8601String() ?? now()->toIso8601String(),
            ])
            ->values()
            ->all();

        return ToolJsonResponse::ok([
            'guests' => $rows,
            'mayHaveMore' => count($rows) >= $limit,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'limit' => $schema->integer()->min(1)->max(80),
            'search' => $schema->string(),
        ];
    }
}
