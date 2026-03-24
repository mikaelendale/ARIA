<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Incident extends Model
{
    use HasUuids;

    protected $fillable = [
        'guest_id',
        'type',
        'trigger_source',
        'severity',
        'description',
        'context',
        'status',
        'resolved_by',
        'resolution_time_seconds',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'context' => 'array',
            'resolution_time_seconds' => 'integer',
            'resolved_at' => 'datetime',
        ];
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function agentActions(): HasMany
    {
        return $this->hasMany(AgentAction::class);
    }
}
