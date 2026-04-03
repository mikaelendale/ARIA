<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GuestChurnFlagged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $guestId,
        public string $guestName,
        public int $score,
    ) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [new Channel('aria-live')];
    }

    public function broadcastAs(): string
    {
        return 'GuestChurnFlagged';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'agent' => 'vera',
            'timestamp' => now()->toIso8601String(),
            'message' => "Guest {$this->guestName} churn risk rose above 70 (score {$this->score}).",
        ];
    }
}
