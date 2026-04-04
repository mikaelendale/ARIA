<?php

namespace App\Http\Controllers;

use App\Ai\Support\RecordsAgentActions;
use App\Models\RoomServiceOrder;
use App\Support\KitchenBoardPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KitchenBoardController extends Controller
{
    public function __construct(
        protected RecordsAgentActions $agentActions,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('kitchen', KitchenBoardPresenter::inertiaPayload());
    }

    public function markDelivered(Request $request, RoomServiceOrder $room_service_order): RedirectResponse
    {
        if ($room_service_order->status !== 'pending') {
            return redirect()->route('kitchen.index');
        }

        $room_service_order->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);

        $this->agentActions->record(
            'kitchen_board_delivered',
            [
                'order_id' => (string) $room_service_order->id,
                'room_number' => $room_service_order->room_number,
            ],
            'ok',
            result: sprintf(
                'Kitchen display marked room service delivered for room %s.',
                $room_service_order->room_number
            ),
            guestId: $room_service_order->guest_id,
            agentName: 'nexus',
        );

        return redirect()->route('kitchen.index');
    }
}
