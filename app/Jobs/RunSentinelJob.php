<?php

namespace App\Jobs;

use App\Ai\Agents\SentinelAgent;
use App\Jobs\Concerns\ProvidesAiTransientQueueRetryPolicy;
use App\Jobs\Concerns\ReleasesOnAiTransientFailure;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RunSentinelJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use ProvidesAiTransientQueueRetryPolicy;
    use Queueable;
    use ReleasesOnAiTransientFailure;
    use SerializesModels;

    public function __construct()
    {
        $this->onQueue('aria-sentinel');
    }

    public function handle(): void
    {
        $this->invokeWithAiTransientRetry(fn () => app(SentinelAgent::class)->run());
    }
}
