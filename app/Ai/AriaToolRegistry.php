<?php

namespace App\Ai;

use App\Ai\Agents\AriaOrchestrator;
use App\Ai\Support\ToolJsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use ReflectionClass;

/**
 * Maps tool names (from each tool's NAME constant) to tool instances sourced from
 * {@see AriaOrchestrator::tools()} so manual dispatch stays aligned with the SDK agent.
 */
class AriaToolRegistry
{
    /** @var array<string, Tool> */
    protected array $toolsByName = [];

    public function __construct(AriaOrchestrator $orchestrator)
    {
        foreach ($orchestrator->tools() as $tool) {
            $name = self::resolveName($tool);
            $this->toolsByName[$name] = $tool;
        }
    }

    protected static function resolveName(Tool $tool): string
    {
        $reflection = new ReflectionClass($tool);

        return $reflection->hasConstant('NAME')
            ? (string) $reflection->getConstant('NAME')
            : Str::snake($reflection->getShortName());
    }

    /**
     * @return list<string>
     */
    public function names(): array
    {
        return array_keys($this->toolsByName);
    }

    public function get(string $name): ?Tool
    {
        return $this->toolsByName[$name] ?? null;
    }

    /**
     * Manual tool invocation (replay, debugging). Prefer the SDK tool loop for normal flows.
     */
    public function run(string $name, array $arguments): string
    {
        $tool = $this->get($name);
        if (! $tool) {
            Log::warning('aria.tool.unknown', ['name' => $name]);

            return ToolJsonResponse::error('Unknown tool name.', ['tool' => $name]);
        }

        return (string) $tool->handle(new Request($arguments));
    }
}
