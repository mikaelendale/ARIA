<?php

namespace App\Ai\Agents;

use App\Ai\Orchestrator;
use App\Events\GuestChurnFlagged;
use App\Models\Guest;
use Illuminate\Support\Facades\Event;

/**
 * VERA — guest churn score heuristics (0–100).
 */
class VeraAgent
{
    public function __construct(
        protected Orchestrator $orchestrator,
    ) {}

    public function updateScore(Guest $guest): int
    {
        $guest->refresh();
        $score = (int) $guest->churn_risk_score;

        if ($guest->incidents()->where('status', 'open')->whereIn('type', ['complaint', 'revenue', 'maintenance'])->exists()) {
            $score += 15;
        }

        if ($guest->last_interaction_at === null || $guest->last_interaction_at->lt(now()->subHours(4))) {
            $score += 10;
        }

        if ($guest->experienceBookings()->where('created_at', '>=', now()->subDays(7))->exists()) {
            $score -= 12;
        }

        if ($guest->roomServiceOrders()->where('placed_at', '>=', now()->subDays(1))->exists()) {
            $score -= 8;
        }

        if ($guest->restaurantVisits()->where('visited_at', '>=', now()->subDays(7))->exists()) {
            $score -= 10;
        }

        $score = max(0, min(100, $score));

        $previous = (int) $guest->churn_risk_score;
        $guest->forceFill(['churn_risk_score' => $score])->save();

        if ($previous <= 70 && $score > 70) {
            Event::dispatch(new GuestChurnFlagged(
                guestId: $guest->id,
                guestName: $guest->name,
                score: $score,
            ));

            $this->orchestrator->handle([
                'type' => 'guest_churn_risk_high',
                'payload' => ['guest_id' => $guest->id],
            ]);
        }

        return $score;
    }
}
