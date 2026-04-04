<?php

namespace App\Ai\Tools;

use App\Ai\Support\ToolJsonResponse;
use App\Support\OpsData;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

/**
 * Read-only: last run time per named agent (from agent_actions).
 */
class ReadAgentsStatus implements Tool
{
    public const NAME = 'read_agents_status';

    public function description(): Stringable|string
    {
        return 'Read when each core agent (nexus, pulse, vera, echo, hermes, sentinel, orchestrator) last fired an action.';
    }

    public function handle(Request $request): Stringable|string
    {
        return ToolJsonResponse::ok([
            'agents' => OpsData::agentsStatus(),
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}
