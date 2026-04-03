<?php

namespace Tests\Feature;

use App\Ai\Agents\EchoAgent;
use App\Ai\Agents\HermesAgent;
use App\Ai\Agents\NexusAgent;
use App\Ai\Agents\PulseAgent;
use App\Ai\Agents\PulsePricingAgent;
use App\Ai\Agents\SentinelAgent;
use App\Ai\Agents\VeraAgent;
use App\Ai\Orchestrator;
use App\Models\Guest;
use App\Models\Incident;
use App\Models\Room;
use App\Models\RoomServiceOrder;
use App\Services\ReviewScraperService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class PhaseSixSubAgentsTest extends TestCase
{
    use RefreshDatabase;

    protected function mockOrchestratorResponse(): array
    {
        return [
            'text' => 'ok',
            'invocation_id' => 'inv-test',
            'tool_calls' => [],
            'tool_results' => [],
            'usage' => [
                'prompt_tokens' => 0,
                'completion_tokens' => 0,
                'cache_write_input_tokens' => 0,
                'cache_read_input_tokens' => 0,
                'reasoning_tokens' => 0,
            ],
            'guest_id' => null,
        ];
    }

    public function test_sentinel_dispatches_room_service_delayed(): void
    {
        $mock = Mockery::mock(Orchestrator::class);
        $mock->shouldReceive('handle')
            ->once()
            ->with(Mockery::on(fn (array $e) => $e['type'] === 'room_service_delayed'))
            ->andReturn($this->mockOrchestratorResponse());
        $this->app->instance(Orchestrator::class, $mock);

        RoomServiceOrder::query()->create([
            'room_number' => 'R-099',
            'status' => 'pending',
            'placed_at' => now()->subHours(1),
        ]);

        $types = app(SentinelAgent::class)->run();
        $this->assertContains('room_service_delayed', $types);
    }

    public function test_sentinel_dispatches_occupancy_threshold(): void
    {
        $mock = Mockery::mock(Orchestrator::class);
        $mock->shouldReceive('handle')
            ->once()
            ->with(Mockery::on(fn (array $e) => $e['type'] === 'occupancy_threshold_crossed'))
            ->andReturn($this->mockOrchestratorResponse());
        $this->app->instance(Orchestrator::class, $mock);

        for ($i = 0; $i < 5; $i++) {
            Room::query()->create([
                'number' => 'T-00'.$i,
                'type' => 'standard',
                'status' => 'occupied',
                'base_price' => 100,
                'current_price' => 100,
                'is_occupied' => true,
            ]);
        }

        $types = app(SentinelAgent::class)->run();
        $this->assertContains('occupancy_threshold_crossed', $types);
    }

    public function test_nexus_merges_context(): void
    {
        $mock = Mockery::mock(Orchestrator::class);
        $mock->shouldReceive('handle')
            ->once()
            ->with(Mockery::on(function (array $e) {
                return isset($e['payload']['nexus_context'])
                    && str_contains($e['payload']['nexus_context'], 'NEXUS');
            }))
            ->andReturn($this->mockOrchestratorResponse());
        $this->app->instance(Orchestrator::class, $mock);

        $out = app(NexusAgent::class)->run(['type' => 'ops', 'payload' => ['foo' => 'bar']]);
        $this->assertSame('ok', $out['text']);
    }

    public function test_pulse_agent_uses_faked_pricing_agent(): void
    {
        PulsePricingAgent::fake(['No pricing changes this hour.']);

        $out = app(PulseAgent::class)->run();

        $this->assertSame('No pricing changes this hour.', $out['text']);
        $this->assertArrayHasKey('occupancy_percent', $out);
    }

    public function test_vera_escalates_when_score_crosses_70(): void
    {
        $mock = Mockery::mock(Orchestrator::class);
        $mock->shouldReceive('handle')
            ->once()
            ->with(Mockery::on(fn (array $e) => $e['type'] === 'guest_churn_risk_high'))
            ->andReturn($this->mockOrchestratorResponse());
        $this->app->instance(Orchestrator::class, $mock);

        $guest = Guest::query()->create([
            'name' => 'Vera Guest',
            'phone' => '+251900000099',
            'churn_risk_score' => 65,
        ]);

        Incident::query()->create([
            'guest_id' => $guest->id,
            'type' => 'complaint',
            'trigger_source' => 'manual',
            'severity' => 'high',
            'description' => 'Noise',
            'status' => 'open',
        ]);

        $score = app(VeraAgent::class)->updateScore($guest);
        $this->assertGreaterThan(70, $score);
    }

    public function test_echo_creates_incident_and_dispatches_negative_review(): void
    {
        $mockReviews = Mockery::mock(ReviewScraperService::class);
        $mockReviews->shouldReceive('getAllReviews')->andReturn([
            [
                'author' => 'A',
                'rating' => 2,
                'text' => 'Bad stay',
                'date' => now()->toIso8601String(),
                'source' => 'test',
            ],
        ]);
        $this->app->instance(ReviewScraperService::class, $mockReviews);

        $mock = Mockery::mock(Orchestrator::class);
        $mock->shouldReceive('handle')
            ->once()
            ->with(Mockery::on(fn (array $e) => $e['type'] === 'negative_review_posted'))
            ->andReturn($this->mockOrchestratorResponse());
        $this->app->instance(Orchestrator::class, $mock);

        app(EchoAgent::class)->run();

        $this->assertSame(1, Incident::query()->where('type', 'reputation')->count());
    }

    public function test_hermes_incoming_call_returns_stub_json(): void
    {
        $response = app(HermesAgent::class)->handleIncomingCall(['CallSid' => 'CA123']);

        $this->assertSame(501, $response->getStatusCode());
        $this->assertStringContainsString('hermes_stub', (string) $response->getContent());
    }

    public function test_hermes_open_realtime_session_throws(): void
    {
        $this->expectException(\RuntimeException::class);

        app(HermesAgent::class)->openRealtimeSession();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
