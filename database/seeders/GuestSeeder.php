<?php

namespace Database\Seeders;

use App\Models\Guest;
use App\Models\Room;
use Illuminate\Database\Seeder;

class GuestSeeder extends Seeder
{
    public function run(): void
    {
        $firstNames = [
            'Abebe', 'Tigist', 'Mulugeta', 'Haymanot', 'Eskinder', 'Meron', 'Yonas',
            'Selam', 'Birtukan', 'Getachew', 'Rahel', 'Dawit', 'Hanna', 'Kebede',
            'Marta', 'Solomon', 'Eden', 'Henok', 'Liya', 'Mesfin',
        ];

        $lastNames = [
            'Bekele', 'Tadesse', 'Alemayehu', 'Girma', 'Haile', 'Worku', 'Assefa',
            'Gebre', 'Tekle', 'Desta', 'Wolde', 'Mengistu', 'Yared', 'Negash',
            'Hailu', 'Tesfaye', 'Bogale', 'Kebede', 'Mulu', 'Demissie',
        ];

        $tagsPool = [
            ['spa', 'vegetarian'],
            ['early_checkout'],
            ['wine'],
            ['quiet_floor'],
            ['family'],
        ];

        $roomNumbers = Room::query()->orderBy('number')->limit(20)->pluck('number')->all();

        for ($i = 0; $i < 20; $i++) {
            $phone = sprintf('+2519%08d', 10000000 + $i);
            $room = $roomNumbers[$i] ?? null;

            Guest::query()->create([
                'name' => $firstNames[$i].' '.$lastNames[$i],
                'phone' => $phone,
                'email' => strtolower(str_replace(' ', '.', $firstNames[$i])).'.guest@example.test',
                'language_preference' => $i % 3 === 0 ? 'am' : 'en',
                'nationality' => 'Ethiopian',
                'churn_risk_score' => ($i * 7) % 71,
                'is_vip' => $i % 5 === 0,
                'preference_tags' => $tagsPool[$i % count($tagsPool)],
                'room_number' => $room,
                'checked_in_at' => now()->subDays($i % 5)->subHours(3),
                'checked_out_at' => null,
                'last_interaction_at' => now()->subHours(($i % 12) + 1),
            ]);
        }
    }
}
