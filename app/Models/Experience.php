<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Experience extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'category',
        'description',
        'price',
        'duration_minutes',
        'is_available',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'duration_minutes' => 'integer',
            'is_available' => 'boolean',
        ];
    }

    public function experienceBookings(): HasMany
    {
        return $this->hasMany(ExperienceBooking::class);
    }
}
