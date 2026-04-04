<?php

namespace App\Http\Controllers;

use App\Jobs\RunOrchestratorJob;
use App\Jobs\RunPulseJob;
use App\Jobs\RunSentinelJob;
use App\Jobs\RunVeraJob;
use App\Models\Guest;
use App\Models\Incident;
use App\Models\Room;
use App\Models\RoomServiceOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TriggerScenarioController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        if (! config('aria.demo_triggers_enabled')) {
            abort(404);
        }

        $scenario = (string) $request->input('scenario', '');

        return match ($scenario) {
            'room_delay' => $this->roomDelay(),
            'angry_tweet' => $this->angryTweet(),
            'occupancy_spike' => $this->occupancySpike(),
            'guest_churn' => $this->guestChurn(),
            default => response()->json(['error' => 'Unknown scenario'], 422),
        };
    }

    private function roomDelay(): JsonResponse
    {
        $guest = Guest::query()
            ->whereNotNull('checked_in_at')
            ->whereNull('checked_out_at')
            ->inRandomOrder()
            ->first();

        if ($guest === null) {
            return response()->json(['error' => 'No active checked-in guest'], 422);
        }

        $order = RoomServiceOrder::query()->create([
            'guest_id' => $guest->id,
            'room_number' => (string) ($guest->room_number ?: 'KV-001'),
            'items' => 'Demo delayed tray — guest request (scenario)',
            'status' => 'pending',
            'placed_at' => now()->subMinutes(40),
        ]);

        RunSentinelJob::dispatch();

        return response()->json([
            'ok' => true,
            'scenario' => 'room_delay',
            'guest_id' => $guest->id,
            'room_service_order_id' => $order->id,
            'dispatched' => [
                ['job' => 'RunSentinelJob', 'queue' => 'aria-sentinel'],
            ],
            'hint' => 'Queue worker on aria-sentinel will run Sentinel; orchestrator tools follow.',
        ]);
    }

    private function angryTweet(): JsonResponse
    {
        $guest = Guest::query()
            ->whereNotNull('checked_in_at')
            ->whereNull('checked_out_at')
            ->inRandomOrder()
            ->first();

        if ($guest === null) {
            $guest = Guest::query()->inRandomOrder()->first();
        }

        if ($guest === null) {
            return response()->json(['error' => 'No guest'], 422);
        }

        RunOrchestratorJob::dispatch([
            'type' => 'negative_social_mention',
            'payload' => [
                'guest_id' => $guest->id,
                'message' => 'Still waiting on dinner — this is not what we expected at Kuriftu. Very disappointed.',
                'platform' => 'twitter',
                'synthetic' => true,
            ],
        ]);

        return response()->json([
            'ok' => true,
            'scenario' => 'angry_tweet',
            'guest_id' => $guest->id,
            'dispatched' => [
                ['job' => 'RunOrchestratorJob', 'queue' => 'aria-core'],
            ],
        ]);
    }

    private function occupancySpike(): JsonResponse
    {
        $rooms = Room::query()->orderBy('number')->limit(70)->get();
        foreach ($rooms as $room) {
            $room->forceFill(['is_occupied' => true])->save();
        }

        RunPulseJob::dispatch();

        return response()->json([
            'ok' => true,
            'scenario' => 'occupancy_spike',
            'rooms_marked_occupied' => $rooms->count(),
            'dispatched' => [
                ['job' => 'RunPulseJob', 'queue' => 'aria-pulse'],
            ],
        ]);
    }

    private function guestChurn(): JsonResponse
    {
        $guest = Guest::query()
            ->whereNotNull('checked_in_at')
            ->whereNull('checked_out_at')
            ->inRandomOrder()
            ->first();

        if ($guest === null) {
            $guest = Guest::query()->inRandomOrder()->first();
        }

        if ($guest === null) {
            return response()->json(['error' => 'No guest'], 422);
        }

        Incident::query()->create([
            'guest_id' => $guest->id,
            'type' => 'complaint',
            'trigger_source' => 'manual',
            'severity' => 'medium',
            'description' => 'Demo: guest follow-up needed (synthetic complaint for churn drill).',
            'context' => ['demo' => true, 'synthetic' => true],
            'status' => 'open',
        ]);

        $guest->forceFill([
            'churn_risk_score' => 58,
            'last_interaction_at' => now()->subHours(6),
        ])->save();

        RunVeraJob::dispatch($guest->id);

        return response()->json([
            'ok' => true,
            'scenario' => 'guest_churn',
            'guest_id' => $guest->id,
            'dispatched' => [
                ['job' => 'RunVeraJob', 'queue' => 'aria-vera'],
            ],
            'hint' => 'Queue worker on aria-vera runs Vera; score should cross 70 and fire orchestration + feed.',
        ]);
    }
}
