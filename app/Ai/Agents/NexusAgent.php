<?php

namespace App\Ai\Agents;

use App\Ai\Orchestrator;

/**
 * NEXUS — operations routing / SLA framing; delegates reasoning to the main orchestrator.
 */
class NexusAgent
{
    public function __construct(
        protected Orchestrator $orchestrator,
    ) {}

    /**
     * @param  array{type?: string, payload?: array<string, mixed>}  $event
     * @return array<string, mixed>
     */
    public function run(array $event): array
    {
        $type = $event['type'] ?? 'nexus_ops';
        $payload = $event['payload'] ?? [];
        $payload['nexus_context'] = 'NEXUS operations agent: route issues to the correct staff, track SLAs, and communicate clearly with guests about operational status. Prefer tools only when they reduce guest friction or escalate safely.';

        return $this->orchestrator->handle([
            'type' => $type,
            'payload' => $payload,
        ]);
    }
}
