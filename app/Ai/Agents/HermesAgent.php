<?php

namespace App\Ai\Agents;

use App\Ai\Orchestrator;
use App\Models\Incident;
use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Hermes — Twilio voice + OpenAI Realtime bridge (skeleton).
 *
 * Production needs a persistent WebSocket process to stream audio; PHP-FPM cannot hold the bridge alone.
 */
class HermesAgent
{
    public function __construct(
        protected Orchestrator $orchestrator,
    ) {}

    /**
     * Twilio voice webhook: validate elsewhere; this stub acknowledges payload shape.
     *
     * @param  array<string, mixed>  $payload
     */
    public function handleIncomingCall(array $payload): JsonResponse
    {
        return response()->json([
            'status' => 'hermes_stub',
            'message' => 'Hermes voice bridge is not fully wired. Use a Realtime worker + Twilio Media Streams.',
            'received_keys' => array_keys($payload),
        ], 501);
    }

    /**
     * @throws RuntimeException
     */
    public function openRealtimeSession(): never
    {
        throw new RuntimeException(
            'OpenAI Realtime WebSocket session must run outside PHP-FPM. See docs/PHASE6-SUB-AGENTS.md.'
        );
    }

    /**
     * @param  array{type?: string, payload?: array<string, mixed>}  $event
     * @return array<string, mixed>
     */
    public function onToolCall(array $event): array
    {
        return $this->orchestrator->handle($event);
    }

    public function onCallEnd(string $transcript): Incident
    {
        return Incident::query()->create([
            'guest_id' => null,
            'type' => 'voice_session',
            'trigger_source' => 'manual',
            'severity' => 'low',
            'description' => 'Voice session transcript (Hermes stub)',
            'context' => ['transcript' => $transcript],
            'status' => 'open',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function realtimeSessionConfig(): array
    {
        return [
            'model' => config('hermes.realtime.model'),
            'modalities' => ['audio', 'text'],
            'instructions' => 'Bilingual Amharic and English Kuriftu Resort voice assistant. Use tools via the same orchestrator as text ARIA.',
            'input_audio_format' => config('hermes.audio.input_format'),
            'turn_detection' => ['type' => config('hermes.audio.vad_mode')],
        ];
    }
}
