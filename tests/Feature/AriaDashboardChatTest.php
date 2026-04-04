<?php

namespace Tests\Feature;

use App\Ai\Agents\AriaChatAgent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AriaDashboardChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_chat_requires_authentication(): void
    {
        $this->postJson('/api/ops/aria/chat', ['message' => 'Hello'])
            ->assertUnauthorized();
    }

    public function test_authenticated_user_receives_sse_stream_with_text_deltas(): void
    {
        AriaChatAgent::fake(['Hello from ARIA.']);

        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post('/api/ops/aria/chat', ['message' => 'Hi there'], [
                'Accept' => 'text/event-stream',
                'X-Requested-With' => 'XMLHttpRequest',
            ]);

        $response->assertOk();
        $response->assertHeader('content-type', 'text/event-stream; charset=UTF-8');

        $content = $response->streamedContent();
        $this->assertIsString($content);
        $this->assertStringContainsString('text-delta', $content);
        $this->assertStringContainsString('[DONE]', $content);
    }
}
