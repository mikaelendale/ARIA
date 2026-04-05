<?php

namespace Tests\Feature;

use App\Ai\Tools\SendWhatsapp;
use App\Models\Guest;
use App\Services\TwilioService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestKioskWhatsappTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->bind(TwilioService::class, function () {
            return new class extends TwilioService
            {
                public function __construct() {}

                public function sendWhatsapp(string $to, string $body): string
                {
                    return 'SM_KIOSK_TEST';
                }
            };
        });
    }

    public function test_guest_whatsapp_send_returns_503_when_kiosk_guest_not_configured(): void
    {
        config(['aria.guest_kiosk_whatsapp_guest_id' => '']);

        $response = $this->postJson('/guest/whatsapp/send', [
            'message' => 'Hello from kiosk',
        ]);

        $response->assertStatus(503);
    }

    public function test_guest_whatsapp_send_uses_send_whatsapp_tool_for_configured_guest(): void
    {
        $guest = Guest::query()->create([
            'name' => 'Kiosk Demo Guest',
            'phone' => '+251900000099',
            'email' => 'kiosk@test.test',
        ]);

        config(['aria.guest_kiosk_whatsapp_guest_id' => $guest->id]);

        $response = $this->postJson('/guest/whatsapp/send', [
            'message' => 'Hello from kiosk',
        ]);

        $response->assertOk();
        $response->assertJsonPath('twilio_sid', 'SM_KIOSK_TEST');

        $this->assertDatabaseHas('agent_actions', [
            'guest_id' => $guest->id,
            'tool_called' => SendWhatsapp::NAME,
            'status' => 'ok',
        ]);
    }

    public function test_guest_whatsapp_send_validates_message(): void
    {
        $guest = Guest::query()->create([
            'name' => 'Kiosk Demo Guest',
            'phone' => '+251900000099',
            'email' => 'kiosk@test.test',
        ]);

        config(['aria.guest_kiosk_whatsapp_guest_id' => $guest->id]);

        $response = $this->postJson('/guest/whatsapp/send', []);

        $response->assertStatus(422);
    }
}
