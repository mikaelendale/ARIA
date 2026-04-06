<?php

namespace App\Jobs\Concerns;

use DateTimeInterface;
use Illuminate\Contracts\Queue\Job;
use Illuminate\Queue\InteractsWithQueue;

/**
 * Database drivers increment {@see Job::attempts()} on every
 * reservation. A successful {@see InteractsWithQueue::release()} still
 * leaves a new row whose attempts grow each run — so worker defaults like --tries=1 fail the
 * job after the first AI rate-limit release. Raise tries and widen the retry window so
 * {@see ReleasesOnAiTransientFailure} can back off across many provider outages.
 */
trait ProvidesAiTransientQueueRetryPolicy
{
    public int $tries = 200;

    public function retryUntil(): DateTimeInterface
    {
        return now()->addDay();
    }
}
