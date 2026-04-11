<?php

namespace App\Ai\Storage;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Ai\Messages\AssistantMessage;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Messages\ToolResultMessage;
use Laravel\Ai\Responses\Data\ToolCall;
use Laravel\Ai\Responses\Data\ToolResult;
use Laravel\Ai\Storage\DatabaseConversationStore;

/**
 * OpenAI Responses + reasoning models require each function_call output item to be preceded
 * by its paired reasoning item. The stock {@see DatabaseConversationStore} omitted
 * reasoning_id / reasoning_summary when hydrating tool calls, and older rows never stored
 * them — both cases yield HTTP 400 on conversation continue.
 *
 * Restores reasoning fields when present and collapses incompatible rows to a single text-only
 * assistant message so multi-turn chat stays usable.
 */
class RepairingDatabaseConversationStore extends DatabaseConversationStore
{
    /**
     * @return Collection<int, Message|AssistantMessage|ToolResultMessage>
     */
    public function getLatestConversationMessages(string $conversationId, int $limit): Collection
    {
        return DB::table('agent_conversation_messages')
            ->where('conversation_id', $conversationId)
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values()
            ->flatMap(function ($record) {
                $toolCalls = collect(json_decode($record->tool_calls, true) ?: []);
                $toolResults = collect(json_decode($record->tool_results, true) ?: []);

                if ($record->role === 'user') {
                    return [new Message('user', $record->content)];
                }

                if ($toolCalls->isNotEmpty()) {
                    if ($this->toolCallsNeedReasoningRepair($toolCalls)) {
                        return [
                            new AssistantMessage($this->collapsedAssistantText($record, $toolCalls, $toolResults)),
                        ];
                    }

                    $messages = [];

                    $messages[] = new AssistantMessage(
                        $record->content ?: '',
                        $toolCalls->map(fn (array $toolCall) => new ToolCall(
                            id: (string) ($toolCall['id'] ?? ''),
                            name: (string) ($toolCall['name'] ?? ''),
                            arguments: is_array($toolCall['arguments'] ?? null) ? $toolCall['arguments'] : [],
                            resultId: $toolCall['result_id'] ?? null,
                            reasoningId: isset($toolCall['reasoning_id']) && $toolCall['reasoning_id'] !== ''
                                ? (string) $toolCall['reasoning_id']
                                : null,
                            reasoningSummary: $this->normalizeReasoningSummary($toolCall['reasoning_summary'] ?? null),
                        ))
                    );

                    if ($toolResults->isNotEmpty()) {
                        $messages[] = new ToolResultMessage(
                            $toolResults->map(fn (array $toolResult) => new ToolResult(
                                id: (string) ($toolResult['id'] ?? ''),
                                name: (string) ($toolResult['name'] ?? ''),
                                arguments: is_array($toolResult['arguments'] ?? null) ? $toolResult['arguments'] : [],
                                result: $toolResult['result'] ?? '',
                                resultId: $toolResult['result_id'] ?? null,
                            ))
                        );
                    }

                    return $messages;
                }

                return [new AssistantMessage($record->content)];
            });
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $toolCalls
     */
    protected function toolCallsNeedReasoningRepair(Collection $toolCalls): bool
    {
        if ($toolCalls->isEmpty()) {
            return false;
        }

        foreach ($toolCalls as $toolCall) {
            $reasoningId = $toolCall['reasoning_id'] ?? null;
            if (is_string($reasoningId) && $reasoningId !== '') {
                continue;
            }

            return true;
        }

        return false;
    }

    protected function normalizeReasoningSummary(mixed $value): ?array
    {
        return is_array($value) && $value !== [] ? $value : null;
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $toolCalls
     * @param  Collection<int, array<string, mixed>>  $toolResults
     */
    protected function collapsedAssistantText(object $record, Collection $toolCalls, Collection $toolResults): string
    {
        $base = trim((string) $record->content);
        $lines = [];

        foreach ($toolCalls as $toolCall) {
            $id = (string) ($toolCall['id'] ?? '');
            $name = (string) ($toolCall['name'] ?? 'tool');
            $tr = $toolResults->firstWhere('id', $id);
            $snippet = '';

            if (is_array($tr)) {
                $res = $tr['result'] ?? '';
                $snippet = is_string($res)
                    ? Str::limit($res, 800)
                    : Str::limit((string) json_encode($res), 800);
            }

            $lines[] = $snippet !== '' ? "[{$name}] {$snippet}" : "[{$name}]";
        }

        $block = implode("\n", $lines);
        $merged = $base !== '' && $block !== ''
            ? $base."\n\n".$block
            : ($base !== '' ? $base : $block);

        if ($merged === '') {
            return '[Earlier assistant tool steps omitted — ask again if you need a fresh lookup.]';
        }

        return Str::limit($merged, 12000);
    }
}
