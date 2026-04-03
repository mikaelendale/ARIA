<?php

namespace Tests\Feature;

use App\Ai\Agents\AriaOrchestrator;
use App\Ai\AriaToolRegistry;
use App\Ai\Orchestrator;
use App\Events\AriaActionFired;
use App\Events\IncidentResolved;
use App\Models\AgentAction;
use App\Models\Guest;
use App\Models\Incident;
use App\Models\Room;
use App\Services\TwilioService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class PhaseFiveOrchestratorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->bind(TwilioService::class, fn () => new class extends TwilioService
        {
            public function __construct() {}

            public function sendWhatsapp(string $to, string $body): string
            {
                return 'SM_FAKE';
            }

            public function sendSms(string $to, string $body): string
            {
                return 'SM_FAKE';
            }
        });
    }

    public function test_handle_fakes_agent_broadcasts_event_and_returns_summary(): void
    {
        AriaOrchestrator::fake(['Summary: no tools needed.']);

        Event::fake();

        $orch = app(Orchestrator::class);
        $out = $orch->handle([
            'type' => 'guest_message',
            'payload' => ['note' => 'hello'],
        ]);

        $this->assertSame('Summary: no tools needed.', $out['text']);
        $this->assertArrayHasKey('invocation_id', $out);
        $this->assertArrayHasKey('usage', $out);

        Event::assertDispatched(AriaActionFired::class, function (AriaActionFired $e) {
            return $e->agentAction->tool_called === 'orchestration'
                && $e->agentAction->result === 'Summary: no tools needed.'
                && ($e->agentAction->payload['event_type'] ?? null) === 'guest_message';
        });
    }

    public function test_build_context_includes_occupancy_and_guest_blocks(): void
    {
        Room::query()->create([
            'number' => 'R-001',
            'type' => 'standard',
            'status' => 'available',
            'base_price' => 100,
            'current_price' => 100,
            'is_occupied' => true,
        ]);
        Room::query()->create([
            'number' => 'R-002',
            'type' => 'standard',
            'status' => 'available',
            'base_price' => 100,
            'current_price' => 100,
            'is_occupied' => false,
        ]);

        $guest = Guest::query()->create([
            'name' => 'Ctx Guest',
            'phone' => '+251900000011',
            'room_number' => 'R-001',
            'is_vip' => true,
            'churn_risk_score' => 42,
        ]);

        Incident::query()->create([
            'guest_id' => $guest->id,
            'type' => 'complaint',
            'trigger_source' => 'manual',
            'severity' => 'low',
            'description' => 'Test',
            'status' => 'open',
        ]);

        AgentAction::query()->create([
            'guest_id' => $guest->id,
            'agent_name' => 'orchestrator',
            'tool_called' => 'log_incident',
            'payload' => [],
            'status' => 'ok',
            'fired_at' => now(),
        ]);

        $orch = app(Orchestrator::class);

        $ref = new \ReflectionMethod(Orchestrator::class, 'buildContext');
        $ref->setAccessible(true);
        $ctx = $ref->invoke($orch, [
            'type' => 'test',
            'payload' => ['guest_id' => $guest->id, 'extra' => 'x'],
        ]);

        $this->assertStringContainsString('50%', $ctx);
        $this->assertStringContainsString('VIP: yes', $ctx);
        $this->assertStringContainsString('Ctx Guest', $ctx);
        $this->assertStringContainsString('R-001', $ctx);
        $this->assertStringContainsString('log_incident', $ctx);
    }

    public function test_aria_tool_registry_runs_known_tool_and_errors_on_unknown(): void
    {
        $registry = app(AriaToolRegistry::class);

        $bad = $registry->run('not_a_real_tool', []);
        $this->assertStringContainsString('Unknown tool name', $bad);

        $this->assertContains('send_whatsapp', $registry->names());
    }

    public function test_resolve_incident_when_payload_contains_resolve_incident_id(): void
    {
        Event::fake();
        AriaOrchestrator::fake(['Done.']);

        $incident = Incident::query()->create([
            'guest_id' => null,
            'type' => 'test',
            'trigger_source' => 'manual',
            'severity' => 'low',
            'description' => 'x',
            'status' => 'open',
        ]);

        $orch = app(Orchestrator::class);
        $orch->handle([
            'type' => 'resolve_test',
            'payload' => [
                'resolve_incident_id' => $incident->id,
            ],
        ]);

        $incident->refresh();
        $this->assertSame('resolved', $incident->status);
        $this->assertNotNull($incident->resolved_at);

        Event::assertDispatched(IncidentResolved::class, function (IncidentResolved $e) use ($incident) {
            return $e->incidentId === $incident->id
                && str_contains($e->message, $incident->id);
        });
    }
}
