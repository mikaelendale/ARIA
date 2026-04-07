<?php

namespace App\Ai\Agents;

use App\Ai\Concerns\ResolvesOpenAiTextModel;
use App\Ai\OpenAiTextDefaults;
use App\Ai\Support\ConfiguredTextProviderFailover;
use App\Ai\Tools\GetGuestDetail;
use App\Ai\Tools\GetIncidentDetail;
use App\Ai\Tools\ListGuests;
use App\Ai\Tools\ListIncidents;
use App\Ai\Tools\ReadAgentsStatus;
use App\Ai\Tools\ReadDashboardSummary;
use App\Ai\Tools\ReadQueueHealth;
use App\Ai\Tools\ReadRecentAgentActions;
use App\Support\OpsData;
use Laravel\Ai\Attributes\MaxSteps;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Promptable;
use Stringable;

/**
 * In-dashboard conversational ARIA with **read-only** tools over {@see OpsData}
 * and guest/incident records. No side-effect tools (no messaging, pricing, or writes).
 */
#[Provider(['openai'])]
#[Model(OpenAiTextDefaults::TEXT_MODEL_ID)]
#[MaxSteps(12)]
class AriaChatAgent implements Agent, Conversational, HasTools
{
    use Promptable;
    use RemembersConversations;
    use ResolvesOpenAiTextModel;

    public function __construct(
        protected ReadDashboardSummary $readDashboardSummary,
        protected ReadRecentAgentActions $readRecentAgentActions,
        protected ReadQueueHealth $readQueueHealth,
        protected ReadAgentsStatus $readAgentsStatus,
        protected ListGuests $listGuests,
        protected GetGuestDetail $getGuestDetail,
        protected ListIncidents $listIncidents,
        protected GetIncidentDetail $getIncidentDetail,
    ) {}

    /**
     * @return list<string>
     */
    public function provider(): array
    {
        return ConfiguredTextProviderFailover::providers();
    }

    public function instructions(): Stringable|string
    {
        return <<<'TXT'
You are ARIA, Kuriftu Resort & Spa’s in-dashboard assistant for staff. You only have **read**
tools: dashboard KPIs, recent agent actions, queue health, agent last-run times, guest lists and
detail, incident lists and detail. Use them to answer factual questions about the hotel’s current
state. Never claim you performed an action (send, book, price change, etc.) — you cannot.

When the user asks about a specific guest or incident, call `get_guest_detail` or `get_incident_detail`
with the UUID from the list tools when possible. Do not invent UUIDs; use `list_guests` / `list_incidents`
first if needed.

Summarize tool results in short, clear language. Prefer citing counts and IDs from tool output.
TXT;
    }

    /**
     * @return iterable<int, Tool>
     */
    public function tools(): iterable
    {
        return [
            $this->readDashboardSummary,
            $this->readRecentAgentActions,
            $this->readQueueHealth,
            $this->readAgentsStatus,
            $this->listGuests,
            $this->getGuestDetail,
            $this->listIncidents,
            $this->getIncidentDetail,
        ];
    }
}
