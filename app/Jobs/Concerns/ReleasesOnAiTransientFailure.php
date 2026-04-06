<?php

namespace App\Jobs\Concerns;

use Illuminate\Support\Facades\Log;
use Laravel\Ai\Exceptions\InsufficientCreditsException;
use Laravel\Ai\Exceptions\ProviderOverloadedException;
use Laravel\Ai\Exceptions\RateLimitedException;

/**
 * When all Laravel AI provider failovers are exhausted, the last error is often
 * {@see RateLimitedException}. Release the queue job for a delayed retry instead of failing.
 */
trait ReleasesOnAiTransientFailure
{
    /**
     * @param  callable(): void  $callback
     */
    protected function invokeWithAiTransientRetry(callable $callback, int $minDelaySeconds = 45, int $maxDelaySeconds = 180): void
    {
        try {
            $callback();
        } catch (RateLimitedException|ProviderOverloadedException|InsufficientCreditsException $e) {
            if ($this->job) {
                $seconds = random_int($minDelaySeconds, $maxDelaySeconds);
                Log::warning('AI provider exhausted transient limits; releasing job for retry.', [
                    'job' => static::class,
                    'exception' => $e::class,
                    'message' => $e->getMessage(),
                    'release_in_seconds' => $seconds,
                ]);
                $this->release($seconds);

                return;
            }

            throw $e;
        }
    }
}
