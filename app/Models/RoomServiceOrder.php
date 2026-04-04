<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomServiceOrder extends Model
{
    use HasUuids;

    protected $fillable = [
        'guest_id',
        'room_number',
        'items',
        'status',
        'placed_at',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'placed_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }
}
