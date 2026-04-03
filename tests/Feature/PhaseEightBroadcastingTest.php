<?php

namespace Tests\Feature;

use App\Ai\Agents\VeraAgent;
use App\Ai\Orchestrator;
use App\Ai\Tools\AdjustPricing;
use App\Events\AriaActionFired;
use App\Events\GuestChurnFlagged;
use App\Events\IncidentResolved;
use App\Events\PricingAdjusted;
use App\Models\AgentAction;
use App\Models\Guest;
use App\Models\Incident;
use App\Models\Room;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Laravel\Ai\Tools\Request as ToolRequest;
use Mockery;
use Tests\TestCase;

class PhaseEightBroadcastingTest extends TestCase
{
    use RefreshDatabase;

    public function test_aria_action_fired_broadcast_payload_shape(): void
    {
        $guest = Guest::query()->create([
            'name' => 'Broadcast Guest',
            'phone' => '+251900000077',
            'churn_risk_score' => 5,
        ]);

        $action = AgentAction::query()->create([
            'guest_id' => $guest->id,
            'agent_name' => 'vera',
            'tool_called' => 'churn_update',
            'payload' => [],
            'status' => 'ok',
            'result' => 'Score updated',
            'revenue_impact' => '12.50',
            'fired_at' => now(),
        ]);
        $action->load('guest');

        $event = new AriaActionFired($action);
        $payload = $event->broadcastWith();

        $this->assertArrayHasKey('action', $payload);
        $this->assertSame('vera', $payload['action']['agent']);
        $this->assertSame('churn_update', $payload['action']['tool']);
        $this->assertSame('Score updated', $payload['action']['message']);
        $this->assertSame('Broadcast Guest', $payload['action']['guest_name']);
        $this->assertSame(12.5, $payload['action']['revenueImpact']);
        $this->assertSame('ok', $payload['action']['status']);
    }

    public function test_guest_churn_flagged_dispatched_when_vera_crosses_threshold(): void
    {
        Event::fake();

        $mock = Mockery::mock(Orchestrator::class);
        $mock->shouldReceive('handle')
            ->once()
            ->andReturn([
                'text' => 'ok',
                'invocation_id' => 'inv',
                'tool_calls' => [],
                'tool_results' => [],
                'usage' => [],
                'guest_id' => null,
            ]);
        $this->app->instance(Orchestrator::class, $mock);

        $guest = Guest::query()->create([
            'name' => 'Churny',
            'phone' => '+251900000066',
            'churn_risk_score' => 65,
        ]);

        Incident::query()->create([
            'guest_id' => $guest->id,
            'type' => 'complaint',
            'trigger_source' => 'manual',
            'severity' => 'high',
            'description' => 'x',
            'status' => 'open',
        ]);

        app(VeraAgent::class)->updateScore($guest);

        Event::assertDispatched(GuestChurnFlagged::class, function (GuestChurnFlagged $e) use ($guest) {
            return $e->guestId === $guest->id
                && $e->guestName === 'Churny'
                && $e->score > 70;
        });
    }

    public function test_pricing_adjusted_dispatched_on_successful_price_change(): void
    {
        Event::fake();

        Room::query()->create([
            'number' => 'R-200',
            'type' => 'deluxe',
            'status' => 'available',
            'base_price' => 200,
            'current_price' => 200,
            'is_occupied' => false,
        ]);

        $tool = app(AdjustPricing::class);
        $tool->handle(new ToolRequest([
            'room_type' => 'deluxe',
            'new_price' => 250,
            'reason' => 'test',
        ]));

        Event::assertDispatched(PricingAdjusted::class, function (PricingAdjusted $e) {
            return $e->amount === 50.0 && $e->agent === 'pulse';
        });
    }

    public function test_incident_resolved_event_payload(): void
    {
        $e = new IncidentResolved('inc-uuid-1', 'Incident inc-uuid-1 resolved (complaint).');
        $data = $e->broadcastWith();

        $this->assertSame('orchestrator', $data['agent']);
        $this->assertSame('Incident inc-uuid-1 resolved (complaint).', $data['message']);
        $this->assertArrayHasKey('timestamp', $data);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
