<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasUuids;

    protected $fillable = [
        'guest_id',
        'room_number',
        'room_type',
        'check_in_date',
        'check_out_date',
        'status',
        'total_amount',
    ];

    protected function casts(): array
    {
        return [
            'check_in_date' => 'datetime',
            'check_out_date' => 'datetime',
            'total_amount' => 'decimal:2',
        ];
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_number', 'number');
    }
}
