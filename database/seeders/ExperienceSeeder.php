<?php

namespace Database\Seeders;

use App\Models\Experience;
use Illuminate\Database\Seeder;

class ExperienceSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'name' => 'Lake Tana Boat Tour',
                'category' => 'tour',
                'description' => 'Guided boat excursion on Lake Tana with historical island highlights.',
                'price' => 3500,
                'duration_minutes' => 180,
                'is_available' => true,
            ],
            [
                'name' => 'Ethiopian Coffee Ceremony',
                'category' => 'activity',
                'description' => 'Traditional coffee ceremony with incense and storytelling.',
                'price' => 850,
                'duration_minutes' => 60,
                'is_available' => true,
            ],
            [
                'name' => 'Spa Package',
                'category' => 'spa',
                'description' => 'Full aromatherapy massage with steam room access.',
                'price' => 5200,
                'duration_minutes' => 120,
                'is_available' => true,
            ],
            [
                'name' => 'Pool Villa Upgrade',
                'category' => 'activity',
                'description' => 'Upgrade to a pool villa with private pool and sunset deck.',
                'price' => 15000,
                'duration_minutes' => 1440,
                'is_available' => true,
            ],
            [
                'name' => 'Dinner at Kuriftu Restaurant',
                'category' => 'dining',
                'description' => 'Chef\'s tasting menu with regional dishes and wine pairing.',
                'price' => 2800,
                'duration_minutes' => 180,
                'is_available' => true,
            ],
        ];

        foreach ($items as $item) {
            Experience::query()->create($item);
        }
    }
}
