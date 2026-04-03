<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExperienceBooking extends Model
{
    use HasUuids;

    protected $fillable = [
        'guest_id',
        'experience_id',
        'status',
        'scheduled_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
        ];
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function experience(): BelongsTo
    {
        return $this->belongsTo(Experience::class);
    }
}
