<?php

namespace App\Events;

use App\Models\AgentAction;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AriaActionFired implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public AgentAction $agentAction,
    ) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [new Channel('aria-live')];
    }

    public function broadcastAs(): string
    {
        return 'AriaActionFired';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $this->agentAction->loadMissing('guest');

        return [
            'action' => [
                'id' => $this->agentAction->id,
                'agent' => $this->normalizeAgent($this->agentAction->agent_name),
                'tool' => $this->agentAction->tool_called,
                'message' => (string) ($this->agentAction->result ?? ''),
                'timestamp' => $this->agentAction->fired_at?->toIso8601String() ?? now()->toIso8601String(),
                'revenueImpact' => (float) ($this->agentAction->revenue_impact ?? 0),
                'status' => $this->agentAction->status,
                'guest_name' => $this->agentAction->guest?->name,
            ],
        ];
    }

    private function normalizeAgent(string $agentName): string
    {
        return match ($agentName) {
            'vera', 'pulse', 'echo', 'nexus', 'hermes', 'sentinel', 'orchestrator' => $agentName,
            default => 'orchestrator',
        };
    }
}
