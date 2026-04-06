<?php

namespace Tests\Feature;

use App\Ai\Agents\SentinelAgent;
use App\Jobs\Concerns\ProvidesAiTransientQueueRetryPolicy;
use App\Jobs\Concerns\ReleasesOnAiTransientFailure;
use App\Jobs\RunEchoJob;
use App\Jobs\RunNexusJob;
use App\Jobs\RunOrchestratorJob;
use App\Jobs\RunPulseJob;
use App\Jobs\RunSentinelJob;
use App\Jobs\RunVeraJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Laravel\Ai\Exceptions\RateLimitedException;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Ensures AI jobs survive many rate-limit releases (worker --tries=1 must not win over job maxTries).
 */
class AiTransientQueueStressTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Config::set('queue.default', 'database');
    }

    #[Test]
    public function dispatched_ai_jobs_encode_high_max_tries_and_retry_until(): void
    {
        RunSentinelJob::dispatch();

        $row = DB::table('jobs')->where('queue', 'aria-sentinel')->first();
        $this->assertNotNull($row);

        $payload = json_decode((string) $row->payload, true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame(200, $payload['maxTries']);
        $this->assertNotNull($payload['retryUntil']);
        $this->assertGreaterThan(Carbon::now()->getTimestamp(), (int) $payload['retryUntil']);

        DB::table('jobs')->delete();
    }

    #[Test]
    public function sentinel_job_survives_multiple_rate_limit_cycles_before_succeeding(): void
    {
        DB::table('jobs')->delete();
        DB::table('failed_jobs')->delete();

        $targetSuccessAttempt = 12;
        $calls = 0;
        $this->mock(SentinelAgent::class, function ($mock) use (&$calls, $targetSuccessAttempt): void {
            $mock->shouldReceive('run')->zeroOrMoreTimes()->andReturnUsing(function () use (&$calls, $targetSuccessAttempt): array {
                $calls++;
                if ($calls < $targetSuccessAttempt) {
                    throw RateLimitedException::forProvider('groq');
                }

                return [];
            });
        });

        Carbon::setTestNow(Carbon::parse('2026-04-06 12:00:00', config('app.timezone')));

        RunSentinelJob::dispatch();

        for ($i = 0; $i < $targetSuccessAttempt; $i++) {
            $this->assertGreaterThan(
                0,
                DB::table('jobs')->where('queue', 'aria-sentinel')->count(),
                'Expected a queued sentinel job before cycle '.($i + 1),
            );

            Artisan::call('queue:work', [
                '--queue' => 'aria-sentinel',
                '--once' => true,
                '--sleep' => 0,
                '--tries' => 1,
            ]);

            Carbon::setTestNow(now()->addMinutes(30));
        }

        $this->assertSame($targetSuccessAttempt, $calls);
        $this->assertSame(0, DB::table('jobs')->where('queue', 'aria-sentinel')->count());
        $this->assertSame(0, DB::table('failed_jobs')->count());

        Carbon::setTestNow();
    }

    #[Test]
    public function all_ai_wrapped_jobs_use_retry_policy_trait(): void
    {
        $classes = [
            RunSentinelJob::class,
            RunOrchestratorJob::class,
            RunPulseJob::class,
            RunNexusJob::class,
            RunEchoJob::class,
            RunVeraJob::class,
        ];

        foreach ($classes as $class) {
            $traits = class_uses_recursive($class);
            $this->assertContains(
                ProvidesAiTransientQueueRetryPolicy::class,
                $traits,
                $class.' should use ProvidesAiTransientQueueRetryPolicy',
            );
            $this->assertContains(
                ReleasesOnAiTransientFailure::class,
                $traits,
                $class.' should use ReleasesOnAiTransientFailure',
            );

            $job = $class === RunOrchestratorJob::class
                ? new RunOrchestratorJob(['type' => 't', 'payload' => []])
                : ($class === RunNexusJob::class
                    ? new RunNexusJob(['type' => 't', 'payload' => []])
                    : ($class === RunVeraJob::class
                        ? new RunVeraJob('00000000-0000-0000-0000-000000000001')
                        : new $class));

            $this->assertGreaterThanOrEqual(200, $job->tries);
            $this->assertGreaterThan(
                now()->getTimestamp(),
                Carbon::createFromInterface($job->retryUntil())->getTimestamp(),
            );
        }
    }
}
