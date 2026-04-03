<?php

namespace Tests\Feature;

use App\Ai\Agents\AriaOrchestrator;
use App\Ai\Agents\DraftReplyAssistant;
use App\Ai\Tools\AdjustPricing;
use App\Ai\Tools\BookExperience;
use App\Ai\Tools\DraftReply;
use App\Ai\Tools\EscalateToHuman;
use App\Ai\Tools\LogIncident;
use App\Ai\Tools\SendWhatsapp;
use App\Models\Experience;
use App\Models\ExperienceBooking;
use App\Models\Guest;
use App\Models\Incident;
use App\Models\Room;
use App\Models\Staff;
use App\Services\TwilioService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request as ToolRequest;
use Tests\TestCase;

class PhaseFourToolBeltTest extends TestCase
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
                    return 'SM_FAKE_WHATSAPP';
                }

                public function sendSms(string $to, string $body): string
                {
                    return 'SM_FAKE_SMS';
                }
            };
        });
    }

    public function test_log_incident_tool_creates_open_incident_and_agent_action(): void
    {
        $tool = app(LogIncident::class);
        $out = $tool->handle(new ToolRequest([
            'type' => 'maintenance',
            'description' => 'AC noise in 305',
            'severity' => 'medium',
        ]));

        $data = json_decode($out, true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame('ok', $data['status']);
        $this->assertArrayHasKey('incident_id', $data);

        $incident = Incident::query()->findOrFail($data['incident_id']);
        $this->assertSame('open', $incident->status);
        $this->assertSame('manual', $incident->trigger_source);

        $this->assertDatabaseHas('agent_actions', [
            'tool_called' => 'log_incident',
            'status' => 'ok',
        ]);
    }

    public function test_send_whatsapp_tool_logs_action_for_guest(): void
    {
        $guest = Guest::query()->create([
            'name' => 'Tool Test Guest',
            'phone' => '+251900000001',
            'email' => 'tool@test.test',
        ]);

        $tool = app(SendWhatsapp::class);
        $out = $tool->handle(new ToolRequest([
            'guest_id' => $guest->id,
            'message' => 'Hello from test',
        ]));

        $data = json_decode($out, true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame('ok', $data['status']);
        $this->assertSame('SM_FAKE_WHATSAPP', $data['twilio_sid']);

        $this->assertDatabaseHas('agent_actions', [
            'guest_id' => $guest->id,
            'tool_called' => 'send_whatsapp',
        ]);
    }

    public function test_book_experience_creates_experience_booking_row(): void
    {
        $guest = Guest::query()->create([
            'name' => 'Exp Guest',
            'phone' => '+251900000002',
        ]);

        $experience = Experience::query()->create([
            'name' => 'Lake Tana Boat Tour',
            'category' => 'tour',
            'description' => 'Test',
            'price' => 100,
            'duration_minutes' => 60,
            'is_available' => true,
        ]);

        $tool = app(BookExperience::class);
        $out = $tool->handle(new ToolRequest([
            'guest_id' => $guest->id,
            'experience_name' => 'lake tana boat tour',
        ]));

        $data = json_decode($out, true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame('ok', $data['status']);

        $this->assertSame(1, ExperienceBooking::query()->count());
        $this->assertDatabaseHas('experience_bookings', [
            'guest_id' => $guest->id,
            'experience_id' => $experience->id,
        ]);
    }

    public function test_draft_reply_tool_stores_incident_when_agent_is_faked(): void
    {
        DraftReplyAssistant::fake(['Thank you for your thoughtful review.']);

        $tool = app(DraftReply::class);
        $out = $tool->handle(new ToolRequest([
            'review_text' => 'Great stay!',
            'rating' => 5,
        ]));

        $data = json_decode($out, true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame('ok', $data['status']);
        $this->assertSame('Thank you for your thoughtful review.', $data['draft']);

        $this->assertDatabaseHas('incidents', [
            'type' => 'reputation',
        ]);

    }

    public function test_aria_orchestrator_registers_ten_tools(): void
    {
        $orch = app(AriaOrchestrator::class);
        $tools = iterator_to_array($orch->tools());
        $this->assertCount(10, $tools);
    }

    public function test_adjust_pricing_updates_rooms_of_type(): void
    {
        Room::query()->create([
            'number' => 'R-099',
            'type' => 'standard',
            'status' => 'available',
            'base_price' => 100,
            'current_price' => 100,
            'is_occupied' => false,
        ]);

        $tool = app(AdjustPricing::class);
        $out = $tool->handle(new ToolRequest([
            'room_type' => 'standard',
            'new_price' => 120,
            'reason' => 'demand spike',
        ]));

        $data = json_decode($out, true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame('ok', $data['status']);
        $this->assertSame(120.0, (float) Room::query()->where('number', 'R-099')->value('current_price'));
    }

    public function test_escalate_to_human_updates_incident_when_provided(): void
    {
        Staff::query()->create([
            'name' => 'Desk',
            'phone' => '+251911100099',
            'department' => 'reception',
            'role' => 'Test',
            'is_available' => true,
        ]);

        $incident = Incident::query()->create([
            'guest_id' => null,
            'type' => 'complaint',
            'trigger_source' => 'manual',
            'severity' => 'high',
            'description' => 'Noise',
            'context' => null,
            'status' => 'open',
        ]);

        $tool = app(EscalateToHuman::class);
        $out = $tool->handle(new ToolRequest([
            'reason' => 'Guest insists on manager',
            'incident_id' => $incident->id,
        ]));

        $data = json_decode($out, true, 512, JSON_THROW_ON_ERROR);
        $this->assertSame('ok', $data['status']);

        $incident->refresh();
        $this->assertSame('escalated', $incident->status);
    }
}
