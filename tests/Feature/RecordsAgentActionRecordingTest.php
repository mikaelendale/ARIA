<?php

namespace Tests\Feature;

use App\Ai\Support\RecordsAgentActions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class RecordsAgentActionRecordingTest extends TestCase
{
    use RefreshDatabase;

    public function test_record_nulls_guest_id_when_guest_row_missing(): void
    {
        $uuid = (string) Str::uuid();

        $action = app(RecordsAgentActions::class)->record(
            'send_whatsapp',
            ['guest_id' => 'unknown'],
            'error',
            result: 'guest not found',
            guestId: $uuid,
        );

        $this->assertNull($action->guest_id);
    }
}
