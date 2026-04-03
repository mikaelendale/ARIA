<?php

namespace App\Jobs;

use App\Ai\Agents\NexusAgent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RunNexusJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    /**
     * @param  array{type?: string, payload?: array<string, mixed>}  $event
     */
    public function __construct(public array $event)
    {
        $this->onQueue('aria-nexus');
    }

    public function handle(): void
    {
        app(NexusAgent::class)->run($this->event);
    }
}
