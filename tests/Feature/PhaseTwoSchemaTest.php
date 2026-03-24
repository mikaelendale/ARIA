<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PhaseTwoSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_domain_tables_exist_after_migrations(): void
    {
        foreach ([
            'guests',
            'rooms',
            'bookings',
            'incidents',
            'agent_actions',
            'staff',
            'experiences',
        ] as $table) {
            $this->assertTrue(
                Schema::hasTable($table),
                "Expected table [{$table}] to exist."
            );
        }
    }
}
