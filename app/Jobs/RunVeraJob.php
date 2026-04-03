<?php

namespace App\Jobs;

use App\Ai\Agents\VeraAgent;
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
    use Queueable;
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

        app(VeraAgent::class)->updateScore($guest);
    }
}
