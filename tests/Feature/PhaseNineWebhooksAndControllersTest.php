<?php

namespace Tests\Feature;

use App\Jobs\RunOrchestratorJob;
use App\Jobs\RunPulseJob;
use App\Jobs\RunSentinelJob;
use App\Jobs\RunVeraJob;
use App\Models\Guest;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PhaseNineWebhooksAndControllersTest extends TestCase
{
    use RefreshDatabase;

    public function test_twilio_voice_returns_twiml_whatsapp_only_notice(): void
    {
        $response = $this->post('/webhook/twilio/voice', [
            'From' => '+15551234567',
            'CallSid' => 'CA123',
        ]);

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/xml; charset=utf-8');
        $content = $response->getContent();
        $this->assertStringContainsString('<Response>', $content);
        $this->assertStringContainsString('WhatsApp', $content);
        $this->assertStringContainsString('Hangup', $content);
        $this->assertDatabaseMissing('guests', ['phone' => '+15551234567']);
    }

    public function test_twilio_whatsapp_dispatches_run_orchestrator_job(): void
    {
        Queue::fake();

        $response = $this->post('/webhook/twilio/whatsapp', [
            'From' => 'whatsapp:+15559876543',
            'Body' => 'Hello ARIA',
        ]);

        $response->assertOk();
        $response->assertJson(['ok' => true]);

        Queue::assertPushed(RunOrchestratorJob::class, function (RunOrchestratorJob $job) {
            return $job->event['type'] === 'whatsapp_inbound'
                && ($job->event['payload']['message'] ?? '') === 'Hello ARIA';
        });
    }

    public function test_demo_trigger_returns_404_when_disabled(): void
    {
        config(['aria.demo_triggers_enabled' => false]);

        $user = User::factory()->create();
        $this->actingAs($user);

        $this->postJson('/api/trigger/scenario', ['scenario' => 'room_delay'])
            ->assertNotFound();
    }

    public function test_demo_trigger_room_delay_when_enabled(): void
    {
        config(['aria.demo_triggers_enabled' => true]);
        Queue::fake();

        $guest = Guest::query()->create([
            'name' => 'In house',
            'phone' => '+251900000001',
            'churn_risk_score' => 10,
            'checked_in_at' => now(),
            'checked_out_at' => null,
            'room_number' => 'KV-001',
        ]);

        $user = User::factory()->create();
        $this->actingAs($user);

        $this->postJson('/api/trigger/scenario', ['scenario' => 'room_delay'])
            ->assertOk()
            ->assertJsonFragment(['scenario' => 'room_delay', 'guest_id' => $guest->id]);

        Queue::assertPushed(RunSentinelJob::class);
        $this->assertDatabaseHas('room_service_orders', [
            'guest_id' => $guest->id,
            'status' => 'pending',
        ]);
    }

    public function test_demo_trigger_guest_churn_dispatches_vera_when_enabled(): void
    {
        config(['aria.demo_triggers_enabled' => true]);
        Queue::fake();

        $guest = Guest::query()->create([
            'name' => 'Churn demo',
            'phone' => '+251900000002',
            'churn_risk_score' => 10,
            'checked_in_at' => now(),
            'checked_out_at' => null,
            'room_number' => 'KV-002',
        ]);

        $user = User::factory()->create();
        $this->actingAs($user);

        $this->postJson('/api/trigger/scenario', ['scenario' => 'guest_churn'])
            ->assertOk()
            ->assertJsonFragment(['scenario' => 'guest_churn', 'guest_id' => $guest->id]);

        Queue::assertPushed(RunVeraJob::class, fn (RunVeraJob $job) => $job->guestId === $guest->id);
    }

    public function test_demo_trigger_occupancy_spike_marks_rooms_and_dispatches_pulse(): void
    {
        config(['aria.demo_triggers_enabled' => true]);
        Queue::fake();

        for ($i = 0; $i < 5; $i++) {
            Room::query()->create([
                'number' => 'P9-'.$i,
                'type' => 'standard',
                'status' => 'available',
                'base_price' => 100,
                'current_price' => 100,
                'is_occupied' => false,
            ]);
        }

        $user = User::factory()->create();
        $this->actingAs($user);

        $this->postJson('/api/trigger/scenario', ['scenario' => 'occupancy_spike'])
            ->assertOk()
            ->assertJsonFragment(['scenario' => 'occupancy_spike', 'rooms_marked_occupied' => 5]);

        $this->assertSame(5, Room::query()->where('is_occupied', true)->count());
        Queue::assertPushed(RunPulseJob::class);
    }

    public function test_dashboard_inertia_includes_ops_payload(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->has('guests')
                ->has('incidentsOpen')
                ->has('initialActions')
                ->has('occupancyPercent')
                ->has('revenueImpactToday')
                ->has('pulseRevenueToday')
                ->has('queueSnapshot'));
    }

    public function test_revenue_inertia_includes_live_payload(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->get(route('revenue'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('revenue')
                ->has('snapshotNote')
                ->has('kpis')
                ->has('daily')
                ->has('segments')
                ->has('scenarios')
                ->has('aiOverview')
                ->has('staffActions'));
    }

    public function test_guest_show_includes_nested_relations(): void
    {
        $user = User::factory()->create();
        $guest = Guest::query()->create([
            'name' => 'Show Me',
            'phone' => '+251900000099',
            'churn_risk_score' => 5,
        ]);

        $this->actingAs($user)
            ->get(route('guests.show', $guest))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('guests/show')
                ->has('guest')
                ->where('guest.id', $guest->id)
                ->has('guest.bookings')
                ->has('guest.incidents')
                ->has('guest.agentActions')
                ->has('guest.preferenceTags'));
    }
}
