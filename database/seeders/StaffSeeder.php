<?php

namespace Database\Seeders;

use App\Models\Staff;
use Illuminate\Database\Seeder;

class StaffSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['name' => 'Kidist Alemu', 'phone' => '+251911100001', 'department' => 'kitchen', 'role' => 'Head Chef', 'is_available' => true],
            ['name' => 'Tewodros Mamo', 'phone' => '+251911100002', 'department' => 'housekeeping', 'role' => 'Supervisor', 'is_available' => true],
            ['name' => 'Yared Solomon', 'phone' => '+251911100003', 'department' => 'maintenance', 'role' => 'Technician', 'is_available' => true],
            ['name' => 'Sara Hailu', 'phone' => '+251911100004', 'department' => 'spa', 'role' => 'Therapist', 'is_available' => true],
            ['name' => 'Daniel Fikru', 'phone' => '+251911100005', 'department' => 'reception', 'role' => 'Front Desk', 'is_available' => true],
            ['name' => 'Amira Tesfaye', 'phone' => '+251911100006', 'department' => 'management', 'role' => 'Duty Manager', 'is_available' => true],
            ['name' => 'Birhanu Kebede', 'phone' => '+251911100007', 'department' => 'kitchen', 'role' => 'Sous Chef', 'is_available' => false],
            ['name' => 'Helen Dawit', 'phone' => '+251911100008', 'department' => 'housekeeping', 'role' => 'Room Attendant', 'is_available' => true],
        ];

        foreach ($rows as $row) {
            Staff::query()->create($row);
        }
    }
}
