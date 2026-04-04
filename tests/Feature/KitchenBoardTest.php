<?php

namespace Tests\Feature;

use App\Models\Guest;
use App\Models\RoomServiceOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class KitchenBoardTest extends TestCase
{
    use RefreshDatabase;

    public function test_kitchen_returns_not_found_when_token_not_configured(): void
    {
        config(['aria.kitchen_display_token' => '']);

        $this->get('/kitchen?token=anything')->assertNotFound();
    }

    public function test_kitchen_returns_forbidden_without_valid_token_or_session(): void
    {
        config(['aria.kitchen_display_token' => 'secret']);

        $this->get('/kitchen')->assertForbidden();
        $this->get('/kitchen?token=wrong')->assertForbidden();
    }

    public function test_kitchen_accepts_valid_query_token(): void
    {
        config(['aria.kitchen_display_token' => 'secret']);

        $this->get('/kitchen?token=secret')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('kitchen')
                ->has('boardBriefing')
                ->has('boardBullets')
                ->has('signals')
                ->has('queueSnapshot')
                ->has('occupancyPercent'));
    }

    public function test_kitchen_allows_refresh_after_session_granted(): void
    {
        config(['aria.kitchen_display_token' => 'secret']);

        $this->get('/kitchen?token=secret')->assertOk();
        $this->get('/kitchen')->assertOk();
    }

    public function test_mark_delivered_updates_order(): void
    {
        config(['aria.kitchen_display_token' => 'secret']);

        $guest = Guest::query()->create([
            'name' => 'Board test guest',
            'phone' => '+251900000099',
            'room_number' => 'KV-099',
            'checked_in_at' => now(),
            'checked_out_at' => null,
        ]);

        $order = RoomServiceOrder::query()->create([
            'guest_id' => $guest->id,
            'room_number' => 'KV-099',
            'items' => 'Coffee + injera',
            'status' => 'pending',
            'placed_at' => now()->subMinutes(12),
            'delivered_at' => null,
        ]);

        $this->get('/kitchen?token=secret')->assertOk();

        $this->post("/kitchen/orders/{$order->id}/delivered")->assertRedirect(route('kitchen.index'));

        $order->refresh();
        $this->assertSame('delivered', $order->status);
        $this->assertNotNull($order->delivered_at);

        $this->assertDatabaseHas('agent_actions', [
            'guest_id' => $guest->id,
            'agent_name' => 'nexus',
            'tool_called' => 'kitchen_board_delivered',
            'status' => 'ok',
        ]);
    }
}
