<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Guest extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'language_preference',
        'nationality',
        'date_of_birth',
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
            'date_of_birth' => 'date',
        ];
    }

    public function restaurantVisits(): HasMany
    {
        return $this->hasMany(RestaurantVisit::class);
    }

    public function roomServiceOrders(): HasMany
    {
        return $this->hasMany(RoomServiceOrder::class);
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

    public function experienceBookings(): HasMany
    {
        return $this->hasMany(ExperienceBooking::class);
    }

    /**
     * Resolve guest for tool calls: primary key UUID, or exact full name when uniquely matchable.
     */
    public static function resolveFromAgentGuestId(string $value): ?self
    {
        $value = trim($value);
        if ($value === '') {
            return null;
        }

        $byId = static::query()->find($value);
        if ($byId) {
            return $byId;
        }

        if (Str::isUuid($value)) {
            return null;
        }

        $matches = static::query()->where('name', $value)->get();

        return $matches->count() === 1 ? $matches->first() : null;
    }
}
