<?php

namespace App\Jobs;

use App\Ai\Agents\PulseAgent;
use App\Jobs\Concerns\ProvidesAiTransientQueueRetryPolicy;
use App\Jobs\Concerns\ReleasesOnAiTransientFailure;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RunPulseJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use ProvidesAiTransientQueueRetryPolicy;
    use Queueable;
    use ReleasesOnAiTransientFailure;
    use SerializesModels;

    public function __construct()
    {
        $this->onQueue('aria-pulse');
    }

    public function handle(): void
    {
        $this->invokeWithAiTransientRetry(fn () => app(PulseAgent::class)->run());
    }
}
