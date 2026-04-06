<?php

namespace App\Jobs;

use App\Ai\Agents\VeraAgent;
use App\Jobs\Concerns\ProvidesAiTransientQueueRetryPolicy;
use App\Jobs\Concerns\ReleasesOnAiTransientFailure;
use App\Models\Guest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RunVeraJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use ProvidesAiTransientQueueRetryPolicy;
    use Queueable;
    use ReleasesOnAiTransientFailure;
    use SerializesModels;

    public function __construct(public string $guestId)
    {
        $this->onQueue('aria-vera');
    }

    public function handle(): void
    {
        $guest = Guest::query()->find($this->guestId);
        if ($guest === null) {
            return;
        }

        $this->invokeWithAiTransientRetry(fn () => app(VeraAgent::class)->updateScore($guest));
    }
}
