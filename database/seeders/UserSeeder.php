<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeded operator accounts (web login). Staff for WhatsApp pings live in StaffSeeder.
 *
 * Password for all: password
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        $accounts = [
            ['name' => 'Selam Tadesse', 'email' => 'gm@aria.local', 'role' => 'gm'],
            ['name' => 'Dawit Mesfin', 'email' => 'ops@aria.local', 'role' => 'operations'],
            ['name' => 'Mahlet Girma', 'email' => 'manager@aria.local', 'role' => 'manager'],
            ['name' => 'Helen Worku', 'email' => 'reception@aria.local', 'role' => 'reception'],
            ['name' => 'Miki Alem', 'email' => 'viewer@aria.local', 'role' => 'viewer'],
        ];

        foreach ($accounts as $row) {
            User::query()->updateOrCreate(
                ['email' => $row['email']],
                [
                    'name' => $row['name'],
                    'password' => $password,
                    'role' => $row['role'],
                    'email_verified_at' => now(),
                ],
            );
        }
    }
}
