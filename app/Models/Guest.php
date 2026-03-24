<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Guest extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'language_preference',
        'nationality',
        'churn_risk_score',
        'is_vip',
        'preference_tags',
        'room_number',
        'checked_in_at',
        'checked_out_at',
        'last_interaction_at',
    ];

    protected function casts(): array
    {
        return [
            'preference_tags' => 'array',
            'is_vip' => 'boolean',
            'churn_risk_score' => 'integer',
            'checked_in_at' => 'datetime',
            'checked_out_at' => 'datetime',
            'last_interaction_at' => 'datetime',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class);
    }

    public function agentActions(): HasMany
    {
        return $this->hasMany(AgentAction::class);
    }
}
