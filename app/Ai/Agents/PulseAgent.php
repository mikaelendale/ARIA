<?php

namespace App\Ai\Agents;

use App\Models\Room;

/**
 * PULSE — occupancy/weekend-aware pricing and promos via a narrow tool belt.
 */
class PulseAgent
{
    public function __construct(
        protected PulsePricingAgent $pulsePricingAgent,
    ) {}

    /**
     * @return array{text: string, invocation_id: string, occupancy_percent: float, is_weekend: bool, tool_calls: mixed, tool_results: mixed, usage: mixed}
     */
    public function run(): array
    {
        $total = Room::query()->count();
        $occupied = Room::query()->where('is_occupied', true)->count();
        $occPct = $total > 0 ? round(100 * $occupied / $total, 1) : 0.0;
        $isWeekend = in_array(now()->dayOfWeek, [0, 6], true);
        $weekendLabel = $isWeekend ? 'yes' : 'no';

        $prompt = <<<TXT
Current hotel occupancy is {$occPct}% ({$occupied} of {$total} rooms marked occupied).
Weekend: {$weekendLabel}.

Decide whether to adjust standard/deluxe/suite/villa pricing, send a promo segment
(all_current, past_guests, or vip_only), or take no tool action and explain briefly.
TXT;

        $response = $this->pulsePricingAgent->prompt($prompt);

        return [
            'text' => $response->text,
            'invocation_id' => $response->invocationId,
            'occupancy_percent' => $occPct,
            'is_weekend' => $isWeekend,
            'tool_calls' => $response->toolCalls,
            'tool_results' => $response->toolResults,
            'usage' => $response->usage,
        ];
    }
}
