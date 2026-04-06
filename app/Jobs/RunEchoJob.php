<?php

namespace App\Jobs;

use App\Ai\Agents\EchoAgent;
use App\Jobs\Concerns\ProvidesAiTransientQueueRetryPolicy;
use App\Jobs\Concerns\ReleasesOnAiTransientFailure;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RunEchoJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use ProvidesAiTransientQueueRetryPolicy;
    use Queueable;
    use ReleasesOnAiTransientFailure;
    use SerializesModels;

    public function __construct()
    {
        $this->onQueue('aria-echo');
    }

    public function handle(): void
    {
        $this->invokeWithAiTransientRetry(fn () => app(EchoAgent::class)->run());
    }
}
