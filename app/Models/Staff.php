<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasUuids;

    protected $table = 'staff';

    protected $fillable = [
        'name',
        'phone',
        'department',
        'role',
        'is_available',
    ];

    protected function casts(): array
    {
        return [
            'is_available' => 'boolean',
        ];
    }
}
