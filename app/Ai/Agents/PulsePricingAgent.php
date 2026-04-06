<?php

namespace App\Ai\Agents;

use App\Ai\Tools\AdjustPricing;
use App\Ai\Tools\SendPromo;
use Laravel\Ai\Attributes\MaxSteps;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\UseCheapestModel;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider(['gemini', 'gemini_secondary', 'groq'])]
#[UseCheapestModel]
#[MaxSteps(10)]
class PulsePricingAgent implements Agent, Conversational, HasTools
{
    use Promptable;

    public function __construct(
        protected AdjustPricing $adjustPricing,
        protected SendPromo $sendPromo,
    ) {}

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
