<?php

namespace App\Ai\Support;

use App\Events\AriaActionFired;
use App\Models\AgentAction;
use App\Models\Guest;
use App\Models\Incident;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Support\Str;

class RecordsAgentActions
{
    public function __construct(
        protected Dispatcher $events,
        protected string $defaultAgentName = 'orchestrator',
    ) {}

    public function defaultAgentName(): string
    {
        return $this->defaultAgentName;
    }

    public function record(
        string $toolCalled,
        array $payload,
        string $status,
        ?string $result = null,
        ?string $guestId = null,
        ?string $incidentId = null,
        ?string $revenueImpact = null,
        ?string $agentName = null,
    ): AgentAction {
        $action = AgentAction::query()->create([
            'agent_name' => $agentName ?? $this->defaultAgentName,
            'tool_called' => $toolCalled,
            'payload' => $payload,
            'status' => $status,
            'result' => $result,
            'guest_id' => self::nullableGuestId($guestId),
            'incident_id' => self::nullableIncidentId($incidentId),
            'revenue_impact' => $revenueImpact,
            'fired_at' => now(),
        ]);

        $action->load('guest');
        $this->events->dispatch(new AriaActionFired($action));

        return $action;
    }

    /**
     * Avoid FK violations when the LLM emits names, placeholders, or invalid UUIDs.
     */
    public static function nullableGuestId(?string $guestId): ?string
    {
        if ($guestId === null || $guestId === '') {
            return null;
        }

        if (! Str::isUuid($guestId)) {
            return null;
        }

        return Guest::query()->whereKey($guestId)->exists() ? $guestId : null;
    }

    public static function nullableIncidentId(?string $incidentId): ?string
    {
        if ($incidentId === null || $incidentId === '') {
            return null;
        }

        if (! Str::isUuid($incidentId)) {
            return null;
        }

        return Incident::query()->whereKey($incidentId)->exists() ? $incidentId : null;
    }
}
