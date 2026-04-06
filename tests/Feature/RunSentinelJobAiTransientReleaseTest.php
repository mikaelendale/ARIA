<?php

namespace Tests\Feature;

use App\Ai\Agents\SentinelAgent;
use App\Jobs\RunSentinelJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Exceptions\RateLimitedException;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RunSentinelJobAiTransientReleaseTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function run_sentinel_job_releases_when_ai_rate_limited_under_real_queue_job(): void
    {
        $this->mock(SentinelAgent::class, function ($mock): void {
            $mock->shouldReceive('run')
                ->once()
                ->andThrow(RateLimitedException::forProvider('groq'));
        });

        $job = new RunSentinelJob;
        $job->withFakeQueueInteractions();
        $job->handle();

        $job->assertReleased();
    }

    #[Test]
    public function run_sentinel_job_rethrows_rate_limit_when_no_queue_job_context(): void
    {
        $this->mock(SentinelAgent::class, function ($mock): void {
            $mock->shouldReceive('run')
                ->once()
                ->andThrow(RateLimitedException::forProvider('groq'));
        });

        $this->expectException(RateLimitedException::class);

        (new RunSentinelJob)->handle();
    }
}
