<?php

namespace App\Ai\Tools;

use App\Ai\Support\ToolJsonResponse;
use App\Support\OpsData;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

/**
 * Read-only: recent ARIA/agent tool executions (action feed).
 */
class ReadRecentAgentActions implements Tool
{
    public const NAME = 'read_recent_agent_actions';

    public function description(): Stringable|string
    {
        return 'Read recent agent actions (tool calls, results, revenue impact). Use limit to cap how many rows (default 15, max 40).';
    }

    public function handle(Request $request): Stringable|string
    {
        $limit = (int) ($request['limit'] ?? 15);
        $limit = max(1, min(40, $limit));

        return ToolJsonResponse::ok([
            'actions' => OpsData::actionFeedItems($limit),
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'limit' => $schema->integer()->min(1)->max(40),
        ];
    }
}
