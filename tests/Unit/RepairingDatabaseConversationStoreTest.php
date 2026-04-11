<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Ai\Contracts\ConversationStore;
use Laravel\Ai\Messages\AssistantMessage;
use Laravel\Ai\Messages\ToolResultMessage;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RepairingDatabaseConversationStoreTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_hydrates_reasoning_fields_on_tool_calls(): void
    {
        $user = User::factory()->create();
        $conversationId = (string) Str::uuid();
        $messageId = (string) Str::uuid();

        DB::table('agent_conversations')->insert([
            'id' => $conversationId,
            'user_id' => $user->id,
            'title' => 'Test',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $toolCalls = [[
            'id' => 'fc_test123456789012345678901234567890',
            'name' => 'read_dashboard_summary',
            'arguments' => [],
            'result_id' => 'call_abc123',
            'reasoning_id' => 'rs_reasoning123456789012345678901234',
            'reasoning_summary' => [['type' => 'summary_text', 'text' => 'Plan lookup.']],
        ]];

        $toolResults = [[
            'id' => 'fc_test123456789012345678901234567890',
            'name' => 'read_dashboard_summary',
            'arguments' => [],
            'result' => '{"ok":true}',
            'result_id' => 'call_abc123',
        ]];

        DB::table('agent_conversation_messages')->insert([
            'id' => $messageId,
            'conversation_id' => $conversationId,
            'user_id' => $user->id,
            'agent' => 'App\\Ai\\Agents\\AriaChatAgent',
            'role' => 'assistant',
            'content' => '',
            'attachments' => '[]',
            'tool_calls' => json_encode($toolCalls),
            'tool_results' => json_encode($toolResults),
            'usage' => '[]',
            'meta' => '[]',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        /** @var ConversationStore $store */
        $store = app(ConversationStore::class);
        $messages = $store->getLatestConversationMessages($conversationId, 50)->all();

        $this->assertCount(2, $messages);
        $this->assertInstanceOf(AssistantMessage::class, $messages[0]);
        $this->assertInstanceOf(ToolResultMessage::class, $messages[1]);
        $first = $messages[0];
        $this->assertSame('rs_reasoning123456789012345678901234', $first->toolCalls->first()->reasoningId);
        $this->assertIsArray($first->toolCalls->first()->reasoningSummary);
    }

    #[Test]
    public function it_collapses_tool_rows_missing_reasoning_to_plain_assistant_text(): void
    {
        $user = User::factory()->create();
        $conversationId = (string) Str::uuid();
        $messageId = (string) Str::uuid();

        DB::table('agent_conversations')->insert([
            'id' => $conversationId,
            'user_id' => $user->id,
            'title' => 'Test',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $toolCalls = [[
            'id' => 'fc_test123456789012345678901234567890',
            'name' => 'read_dashboard_summary',
            'arguments' => [],
            'result_id' => 'call_abc123',
        ]];

        $toolResults = [[
            'id' => 'fc_test123456789012345678901234567890',
            'name' => 'read_dashboard_summary',
            'arguments' => [],
            'result' => '{"pulse_revenue_today":0}',
            'result_id' => 'call_abc123',
        ]];

        DB::table('agent_conversation_messages')->insert([
            'id' => $messageId,
            'conversation_id' => $conversationId,
            'user_id' => $user->id,
            'agent' => 'App\\Ai\\Agents\\AriaChatAgent',
            'role' => 'assistant',
            'content' => 'Here are the figures.',
            'attachments' => '[]',
            'tool_calls' => json_encode($toolCalls),
            'tool_results' => json_encode($toolResults),
            'usage' => '[]',
            'meta' => '[]',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        /** @var ConversationStore $store */
        $store = app(ConversationStore::class);
        $messages = $store->getLatestConversationMessages($conversationId, 50)->all();

        $this->assertCount(1, $messages);
        $this->assertInstanceOf(AssistantMessage::class, $messages[0]);
        $this->assertTrue($messages[0]->toolCalls->isEmpty());
        $this->assertStringContainsString('Here are the figures.', $messages[0]->content);
        $this->assertStringContainsString('read_dashboard_summary', $messages[0]->content);
        $this->assertStringContainsString('pulse_revenue_today', $messages[0]->content);
    }
}
