<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $primaryKey = 'number';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'number',
        'type',
        'status',
        'base_price',
        'current_price',
        'is_occupied',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'current_price' => 'decimal:2',
            'is_occupied' => 'boolean',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'room_number', 'number');
    }
}
