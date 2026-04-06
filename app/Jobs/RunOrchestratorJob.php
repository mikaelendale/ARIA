<?php

namespace App\Jobs;

use App\Ai\Orchestrator;
use App\Jobs\Concerns\ProvidesAiTransientQueueRetryPolicy;
use App\Jobs\Concerns\ReleasesOnAiTransientFailure;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RunOrchestratorJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use ProvidesAiTransientQueueRetryPolicy;
    use Queueable;
    use ReleasesOnAiTransientFailure;
    use SerializesModels;

    /**
     * @param  array{type?: string, payload?: array<string, mixed>}  $event
     */
    public function __construct(public array $event)
    {
        $this->onQueue('aria-core');
    }

    public function handle(): void
    {
        $this->invokeWithAiTransientRetry(fn () => app(Orchestrator::class)->handle($this->event));
    }
}
