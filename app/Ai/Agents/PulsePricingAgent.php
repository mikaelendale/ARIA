<?php

namespace App\Ai\Agents;

use App\Ai\Concerns\ResolvesOpenAiTextModel;
use App\Ai\OpenAiTextDefaults;
use App\Ai\Support\ConfiguredTextProviderFailover;
use App\Ai\Tools\AdjustPricing;
use App\Ai\Tools\SendPromo;
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
#[MaxSteps(10)]
class PulsePricingAgent implements Agent, Conversational, HasTools
{
    use Promptable;
    use ResolvesOpenAiTextModel;

    public function __construct(
        protected AdjustPricing $adjustPricing,
        protected SendPromo $sendPromo,
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
You are PULSE, Kuriftu Resort revenue optimization. You may only use the adjust_pricing and
send_promo tools. Use occupancy and weekend context in the user message to decide whether to
change prices by room type, send a targeted promo, or respond that no action is needed.
Never invent room types or guest segments; use tool parameters exactly as needed.
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
            $this->adjustPricing,
            $this->sendPromo,
        ];
    }
}
