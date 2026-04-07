<?php

namespace Tests\Feature;

use App\Ai\Agents\AriaOrchestrator;
use App\Ai\Agents\PulsePricingAgent;
use App\Ai\Orchestrator;
use App\Events\AriaActionFired;
use App\Jobs\RunEchoJob;
use App\Jobs\RunNexusJob;
use App\Jobs\RunOrchestratorJob;
use App\Jobs\RunPulseJob;
use App\Jobs\RunSentinelJob;
use App\Jobs\RunVeraJob;
use App\Models\Guest;
use App\Models\RoomServiceOrder;
use App\Services\ReviewScraperService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Event;
use Mockery;
use Tests\TestCase;

class PhaseSevenJobsTest extends TestCase
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

    public function test_run_orchestrator_job_delegates_to_orchestrator(): void
    {
        AriaOrchestrator::fake(['Job ok.']);
        Event::fake();

        $job = new RunOrchestratorJob(['type' => 'test', 'payload' => ['x' => 1]]);
        $this->assertSame('aria-core', $job->queue);
        $job->handle();

        Event::assertDispatched(AriaActionFired::class);
    }

    public function test_run_sentinel_job_delegates_to_sentinel(): void
    {
        $mock = Mockery::mock(Orchestrator::class);
        $mock->shouldReceive('handle')
            ->once()
            ->with(Mockery::on(fn (array $e) => $e['type'] === 'room_service_delayed'))
            ->andReturn($this->mockOrchestratorResponse());
        $this->app->instance(Orchestrator::class, $mock);

        RoomServiceOrder::query()->create([
            'room_number' => 'R-088',
            'status' => 'pending',
            'placed_at' => now()->subHours(1),
        ]);

        $job = new RunSentinelJob;
        $this->assertSame('aria-sentinel', $job->queue);
        $job->handle();
    }

    public function test_run_nexus_job_delegates_to_nexus(): void
    {
        $mock = Mockery::mock(Orchestrator::class);
        $mock->shouldReceive('handle')
            ->once()
            ->with(Mockery::on(fn (array $e) => ($e['type'] ?? null) === 'ops_route'))
            ->andReturn($this->mockOrchestratorResponse());
        $this->app->instance(Orchestrator::class, $mock);

        $job = new RunNexusJob(['type' => 'ops_route', 'payload' => []]);
        $this->assertSame('aria-nexus', $job->queue);
        $job->handle();
    }

    public function test_run_pulse_job_delegates_to_pulse(): void
    {
        PulsePricingAgent::fake(['No changes.']);

        $job = new RunPulseJob;
        $this->assertSame('aria-pulse', $job->queue);
        $job->handle();
    }

    public function test_run_vera_job_updates_guest_when_found(): void
    {
        $mock = Mockery::mock(Orchestrator::class);
        $mock->shouldReceive('handle')->zeroOrMoreTimes()->andReturn($this->mockOrchestratorResponse());
        $this->app->instance(Orchestrator::class, $mock);

        $guest = Guest::query()->create([
            'name' => 'Job Guest',
            'phone' => '+251900000088',
            'churn_risk_score' => 10,
        ]);

        $job = new RunVeraJob($guest->id);
        $this->assertSame('aria-vera', $job->queue);
        $job->handle();

        $guest->refresh();
        $this->assertIsInt($guest->churn_risk_score);
    }

    public function test_run_vera_job_noops_when_guest_missing(): void
    {
        $job = new RunVeraJob('00000000-0000-0000-0000-000000000000');
        $job->handle();
        $this->assertTrue(true);
    }

    public function test_run_echo_job_delegates_to_echo(): void
    {
        $mockReviews = Mockery::mock(ReviewScraperService::class);
        $mockReviews->shouldReceive('getAllReviews')->andReturn([]);
        $this->app->instance(ReviewScraperService::class, $mockReviews);

        $mock = Mockery::mock(Orchestrator::class);
        $mock->shouldReceive('handle')->zeroOrMoreTimes()->andReturn($this->mockOrchestratorResponse());
        $this->app->instance(Orchestrator::class, $mock);

        $job = new RunEchoJob;
        $this->assertSame('aria-echo', $job->queue);
        $job->handle();
    }

    public function test_schedule_does_not_register_ai_jobs_by_default(): void
    {
        Artisan::call('schedule:list');
        $output = Artisan::output();

        $this->assertStringNotContainsString(RunSentinelJob::class, $output);
        $this->assertStringNotContainsString(RunEchoJob::class, $output);
        $this->assertStringNotContainsString(RunPulseJob::class, $output);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
