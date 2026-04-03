<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $types = ['standard', 'deluxe', 'suite', 'villa'];
        $baseByType = [
            'standard' => 4200,
            'deluxe' => 6800,
            'suite' => 11200,
            'villa' => 18500,
        ];
        $statuses = ['available', 'occupied', 'cleaning', 'maintenance'];

        // Kuriftu-style codes: KV = resort villa block; types map to standard / deluxe / suite / villa inventory.
        for ($i = 1; $i <= 80; $i++) {
            $type = $types[($i - 1) % 4];
            $number = sprintf('KV-%03d', $i);
            $base = $baseByType[$type];
            $delta = (($i % 7) - 3) * 150;
            $current = max(1000, $base + $delta);
            $status = $statuses[$i % count($statuses)];
            $isOccupied = $status === 'occupied';

            Room::query()->updateOrCreate(
                ['number' => $number],
                [
                    'type' => $type,
                    'status' => $status,
                    'base_price' => $base,
                    'current_price' => $current,
                    'is_occupied' => $isOccupied,
                ]
            );
        }
    }
}
