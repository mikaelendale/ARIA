<?php

namespace App\Ai\Tools;

use App\Ai\Support\ToolJsonResponse;
use App\Support\OpsData;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

/**
 * Read-only: ARIA queue depths and recent failed jobs.
 */
class ReadQueueHealth implements Tool
{
    public const NAME = 'read_queue_health';

    public function description(): Stringable|string
    {
        return 'Read queue health: pending jobs per ARIA queue, total pending, failed jobs in last 24h.';
    }

    public function handle(Request $request): Stringable|string
    {
        return ToolJsonResponse::ok([
            'queue' => OpsData::queueSnapshot(),
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [];
    }
}
