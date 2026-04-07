<?php

namespace App\Ai\Agents;

use App\Ai\Concerns\ResolvesOpenAiTextModel;
use App\Ai\OpenAiTextDefaults;
use App\Ai\Support\ConfiguredTextProviderFailover;
use App\Ai\Tools\AdjustPricing;
use App\Ai\Tools\AlertManager;
use App\Ai\Tools\ApplyDiscount;
use App\Ai\Tools\BookExperience;
use App\Ai\Tools\DraftReply;
use App\Ai\Tools\EscalateToHuman;
use App\Ai\Tools\LogIncident;
use App\Ai\Tools\PingKitchen;
use App\Ai\Tools\SendPromo;
use App\Ai\Tools\SendWhatsapp;
use Laravel\Ai\Attributes\MaxSteps;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider(['openai'])]
#[Model(OpenAiTextDefaults::TEXT_MODEL_ID)]
#[MaxSteps(15)]
class AriaOrchestrator implements Agent, Conversational, HasTools
{
    use Promptable;
    use ResolvesOpenAiTextModel;

    public function __construct(
        protected SendWhatsapp $sendWhatsapp,
        protected PingKitchen $pingKitchen,
        protected AlertManager $alertManager,
        protected ApplyDiscount $applyDiscount,
        protected BookExperience $bookExperience,
        protected AdjustPricing $adjustPricing,
        protected DraftReply $draftReply,
        protected LogIncident $logIncident,
        protected SendPromo $sendPromo,
        protected EscalateToHuman $escalateToHuman,
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
You are ARIA, the Kuriftu Resort & Spa AI orchestrator. You coordinate guest experience,
staff alerts, incidents, and revenue-aware actions using the registered tools. Prefer safe,
policy-compliant choices; ask for clarification when context is insufficient for high-impact actions.
WhatsApp messages to guests must sound warm, concise, and professional — never robotic; sign off in spirit of hospitality.
When the context includes "Tool contract (critical)" with a guest UUID, always use that exact UUID for tools that require guest_id — never invent or substitute strings like "unknown".
TXT;
    }

    public function messages(): iterable
    {
        return [];
    }

    /**
     * @return iterable<int, Tool>
     */
    public function tools(): iterable
    {
        return [
            $this->sendWhatsapp,
            $this->pingKitchen,
            $this->alertManager,
            $this->applyDiscount,
            $this->bookExperience,
            $this->adjustPricing,
            $this->draftReply,
            $this->logIncident,
            $this->sendPromo,
            $this->escalateToHuman,
        ];
    }
}
