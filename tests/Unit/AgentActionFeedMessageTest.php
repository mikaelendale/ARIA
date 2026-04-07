<?php

namespace Tests\Unit;

use App\Models\AgentAction;
use App\Models\Guest;
use App\Support\AgentActionFeedMessage;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AgentActionFeedMessageTest extends TestCase
{
    #[Test]
    public function send_whatsapp_includes_message_and_compact_ref_for_twilio_sid(): void
    {
        $action = new AgentAction([
            'tool_called' => 'send_whatsapp',
            'result' => 'SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            'payload' => ['message' => 'Your room is ready.'],
            'status' => 'ok',
        ]);
        $action->setRelation('guest', new Guest(['name' => 'Alex']));

        $line = AgentActionFeedMessage::forFeed($action);

        $this->assertStringContainsString('WhatsApp to Alex', $line);
        $this->assertStringContainsString('Your room is ready', $line);
        $this->assertStringContainsString('Ref SM', $line);
    }

    #[Test]
    public function log_incident_summarizes_payload_and_compact_ref_for_uuid(): void
    {
        $uuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        $action = new AgentAction([
            'tool_called' => 'log_incident',
            'result' => $uuid,
            'payload' => [
                'type' => 'noise',
                'severity' => 'high',
                'description' => 'Loud party in hallway.',
            ],
            'status' => 'ok',
        ]);

        $line = AgentActionFeedMessage::forFeed($action);

        $this->assertStringContainsString('noise', $line);
        $this->assertStringContainsString('high', $line);
        $this->assertStringContainsString('Loud party', $line);
        $this->assertStringContainsString('Ref a0eebc99', $line);
    }

    #[Test]
    public function orchestration_prefixes_event_type(): void
    {
        $action = new AgentAction([
            'tool_called' => 'orchestration',
            'result' => 'Guest checked in smoothly.',
            'payload' => ['event_type' => 'check_in'],
            'status' => 'ok',
        ]);

        $line = AgentActionFeedMessage::forFeed($action);

        $this->assertStringStartsWith('[check_in]', $line);
        $this->assertStringContainsString('checked in', $line);
    }
}
