<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Ai\Audio;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Transcription;
use Throwable;
use function Laravel\Ai\agent;

class HermesVoiceController extends Controller
{
    private const SYSTEM_PROMPT = <<<'PROMPT'
You are Hermes, the voice concierge of Kuriftu Resort.
You speak both Amharic and English fluently — detect which language the guest is using and always respond in that same language.
You are warm, professional, and concise.
This is a voice conversation so keep replies to 2-3 sentences maximum.
Help guests with room service, spa bookings, dining reservations, and any complaints.
Never say you cannot help — always offer an alternative.
PROMPT;

    /**
     * POST /api/hermes/transcribe
     *
     * Accepts an audio upload and returns the text transcript.
     */
    public function transcribe(Request $request): JsonResponse
    {
        $request->validate([
            'audio' => ['required', 'file', 'mimes:webm,mp3,wav,ogg', 'max:10240'],
        ]);

        try {
            // Transcription model is set in config/ai.php (default: whisper-1 — already the fastest).
            $transcript = Transcription::fromUpload($request->file('audio'))->generate();

            return response()->json(['transcript' => (string) $transcript]);
        } catch (Throwable $e) {
            report($e);

            return response()->json(
                ['error' => 'Transcription failed. Please try again.'],
                503,
            );
        }
    }

    /**
     * POST /api/hermes/respond
     *
     * Accepts a transcript + conversation history, returns a text reply.
     *
     * History format (last 10 pairs):
     *   [{ "role": "user"|"assistant", "content": "..." }, ...]
     */
    public function respond(Request $request): JsonResponse
    {
        $data = $request->validate([
            'transcript' => ['required', 'string', 'max:4000'],
            'history' => ['nullable', 'array', 'max:20'],
            'history.*.role' => ['required', 'string', 'in:user,assistant'],
            'history.*.content' => ['required', 'string', 'max:4000'],
        ]);

        $history = array_slice((array) ($data['history'] ?? []), -20);

        $messages = array_map(
            fn (array $m) => new Message($m['role'], $m['content']),
            $history,
        );

        try {
            // gpt-4o-mini: ~5× faster than gpt-4o for short replies; ample for 2-3 sentence answers.
            $response = agent(
                instructions: self::SYSTEM_PROMPT,
                messages: $messages,
            )->prompt($data['transcript'], model: 'gpt-4o-mini');

            return response()->json(['reply' => (string) $response]);
        } catch (Throwable $e) {
            report($e);

            return response()->json(
                ['error' => 'Reply generation failed. Please try again.'],
                503,
            );
        }
    }

    /**
     * POST /api/hermes/speak
     *
     * Converts text to speech and streams audio/mpeg back.
     */
    public function speak(Request $request): Response
    {
        $data = $request->validate([
            'text' => ['required', 'string', 'max:1000'],
        ]);

        try {
            // Use tts-1 (not tts-1-hd) in config/ai.php for ~2× faster TTS with acceptable quality.
            $audio = Audio::of($data['text'])
                ->female()
                ->instructions('Warm, calm, and professional hotel concierge. Clear diction, gentle pace.')
                ->generate();

            return response((string) $audio, 200, [
                'Content-Type' => 'audio/mpeg',
                'Cache-Control' => 'no-store',
            ]);
        } catch (Throwable $e) {
            report($e);

            return response('', 503);
        }
    }
}
