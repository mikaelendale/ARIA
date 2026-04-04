<?php

namespace App\Http\Responses;

use Laravel\Ai\Responses\StreamableAgentResponse;
use Laravel\Ai\Responses\StreamedAgentResponse;
use Laravel\Ai\Streaming\Events\StreamEnd;
use Laravel\Ai\Streaming\Events\StreamStart;
use Laravel\Ai\Streaming\Events\ToolCall;
use Laravel\Ai\Streaming\Events\ToolResult;
use Symfony\Component\HttpFoundation\Response;

/**
 * Streams a {@see StreamableAgentResponse} using the Vercel AI UI protocol, then appends a custom
 * SSE event with the persisted conversation id (after {@see RemembersConversations} middleware runs).
 */
final class AriaChatStreamResponse
{
    public static function from(StreamableAgentResponse $stream): Response
    {
        $stream->then(function (StreamedAgentResponse $response) use ($stream): void {
            if ($response->conversationId !== null) {
                $stream->withinConversation($response->conversationId, $response->conversationUser);
            }
        });

        return response()->stream(
            static function () use ($stream) {
                $state = new class
                {
                    public bool $streamStarted = false;

                    /** @var array<string, true> */
                    public array $toolCalls = [];

                    public ?array $lastStreamEndEvent = null;
                };

                foreach ($stream as $event) {
                    if ($event instanceof StreamStart) {
                        if ($state->streamStarted) {
                            continue;
                        }

                        $state->streamStarted = true;
                    }

                    if ($event instanceof ToolCall) {
                        $state->toolCalls[$event->toolCall->id] = true;
                    }

                    if ($event instanceof ToolResult &&
                        ! isset($state->toolCalls[$event->toolResult->id])) {
                        continue;
                    }

                    if ($event instanceof StreamEnd) {
                        $state->lastStreamEndEvent = $event->toVercelProtocolArray();

                        continue;
                    }

                    if (empty($data = $event->toVercelProtocolArray())) {
                        continue;
                    }

                    yield 'data: '.json_encode($data)."\n\n";
                }

                if ($state->lastStreamEndEvent !== null) {
                    yield 'data: '.json_encode($state->lastStreamEndEvent)."\n\n";
                }

                if ($stream->conversationId !== null) {
                    yield 'data: '.json_encode([
                        'type' => 'data-aria-conversation',
                        'conversationId' => $stream->conversationId,
                    ])."\n\n";
                }

                yield "data: [DONE]\n\n";
            },
            headers: [
                'Cache-Control' => 'no-cache, no-transform',
                'Content-Type' => 'text/event-stream',
                'x-vercel-ai-ui-message-stream' => 'v1',
            ],
        );
    }
}
