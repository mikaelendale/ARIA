<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentAction extends Model
{
    use HasUuids;

    protected $fillable = [
        'incident_id',
        'guest_id',
        'agent_name',
        'tool_called',
        'payload',
        'status',
        'result',
        'revenue_impact',
        'fired_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'revenue_impact' => 'decimal:2',
            'fired_at' => 'datetime',
        ];
    }

    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }
}
