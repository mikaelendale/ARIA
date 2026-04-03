<?php

namespace App\Ai\Agents;

use App\Ai\Orchestrator;
use App\Models\Guest;
use App\Models\Room;
use App\Models\RoomServiceOrder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SentinelAgent
{
    public function __construct(
        protected Orchestrator $orchestrator,
    ) {}

    /**
     * Run Sentinel checks and dispatch the orchestrator for each firing condition.
     *
     * @return list<string> Event types dispatched (may contain duplicates if multiple entities match).
     */
    public function run(): array
    {
        $dispatched = [];

        foreach ($this->delayedRoomServiceOrders() as $order) {
            $this->orchestrator->handle([
                'type' => 'room_service_delayed',
                'payload' => [
                    'order_id' => $order->id,
                    'guest_id' => $order->guest_id,
                    'room_number' => $order->room_number,
                    'placed_at' => $order->placed_at?->toIso8601String(),
                ],
            ]);
            $dispatched[] = 'room_service_delayed';
        }

        foreach ($this->housekeepingOverdueRooms() as $room) {
            $this->orchestrator->handle([
                'type' => 'housekeeping_miss',
                'payload' => [
                    'room_number' => $room->number,
                    'room_updated_at' => $room->updated_at?->toIso8601String(),
                ],
            ]);
            $dispatched[] = 'housekeeping_miss';
        }

        if ($this->occupancyAboveThreshold(80.0)) {
            $this->orchestrator->handle([
                'type' => 'occupancy_threshold_crossed',
                'payload' => ['occupancy_percent' => $this->occupancyPercent()],
            ]);
            $dispatched[] = 'occupancy_threshold_crossed';
        }

        foreach ($this->radioSilenceGuests() as $guest) {
            $this->orchestrator->handle([
                'type' => 'guest_radio_silence',
                'payload' => ['guest_id' => $guest->id],
            ]);
            $dispatched[] = 'guest_radio_silence';
        }

        foreach ($this->birthdayGuestsToday() as $guest) {
            $this->orchestrator->handle([
                'type' => 'guest_birthday',
                'payload' => ['guest_id' => $guest->id],
            ]);
            $dispatched[] = 'guest_birthday';
        }

        foreach ($this->guestsWithNoRestaurantVisitDayTwoPlus() as $guest) {
            $this->orchestrator->handle([
                'type' => 'no_restaurant_visit',
                'payload' => ['guest_id' => $guest->id],
            ]);
            $dispatched[] = 'no_restaurant_visit';
        }

        return $dispatched;
    }

    /**
     * @return Collection<int, RoomServiceOrder>
     */
    protected function delayedRoomServiceOrders()
    {
        return RoomServiceOrder::query()
            ->where('status', '!=', 'delivered')
            ->where('placed_at', '<', now()->subMinutes(35))
            ->get();
    }

    /**
     * Rooms stuck in cleaning beyond a simple SLA window (proxy for "missed" housekeeping).
     *
     * @return Collection<int, Room>
     */
    protected function housekeepingOverdueRooms()
    {
        return Room::query()
            ->where('status', 'cleaning')
            ->where('updated_at', '<', now()->subMinutes(30))
            ->get();
    }

    protected function occupancyAboveThreshold(float $thresholdPercent): bool
    {
        return $this->occupancyPercent() > $thresholdPercent;
    }

    protected function occupancyPercent(): float
    {
        $total = Room::query()->count();
        if ($total === 0) {
            return 0.0;
        }

        $occupied = Room::query()->where('is_occupied', true)->count();

        return round(100 * $occupied / $total, 1);
    }

    /**
     * @return Collection<int, Guest>
     */
    protected function radioSilenceGuests()
    {
        return Guest::query()
            ->whereNotNull('checked_in_at')
            ->whereNull('checked_out_at')
            ->where('checked_in_at', '<', now()->subHours(6))
            ->whereNull('last_interaction_at')
            ->get();
    }

    /**
     * @return Collection<int, Guest>
     */
    protected function birthdayGuestsToday()
    {
        return Guest::query()
            ->whereNotNull('date_of_birth')
            ->whereMonth('date_of_birth', now()->month)
            ->whereDay('date_of_birth', now()->day)
            ->get();
    }

    /**
     * @return Collection<int, Guest>
     */
    protected function guestsWithNoRestaurantVisitDayTwoPlus()
    {
        return Guest::query()
            ->whereNotNull('checked_in_at')
            ->whereNull('checked_out_at')
            ->where('checked_in_at', '<=', now()->subDays(2))
            ->whereNotExists(function ($q) {
                $q->select(DB::raw('1'))
                    ->from('restaurant_visits')
                    ->whereColumn('restaurant_visits.guest_id', 'guests.id')
                    ->whereRaw('restaurant_visits.visited_at >= guests.checked_in_at');
            })
            ->get();
    }
}
