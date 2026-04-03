<?php

namespace App\Http\Controllers;

use App\Jobs\RunOrchestratorJob;
use App\Models\Guest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Twilio\TwiML\VoiceResponse;

class WebhookController extends Controller
{
    /**
     * Inbound voice webhook — deferred to a future Hermes / Media Streams release.
     * Returns valid TwiML so Twilio can hang up cleanly if a number still points here.
     */
    public function twilioVoice(Request $request): Response
    {
        $voice = new VoiceResponse;
        $voice->say(
            'Thanks for calling ARIA. This version supports WhatsApp messaging only. Please message us on WhatsApp to reach the concierge.',
            ['voice' => 'Polly.Joanna']
        );
        $voice->hangup();

        return response($voice->asXML(), 200, ['Content-Type' => 'text/xml; charset=utf-8']);
    }

    public function twilioWhatsapp(Request $request): JsonResponse
    {
        $from = $this->normalizePhone($request->input('From'));
        $body = (string) $request->input('Body', '');

        $guest = Guest::query()->firstOrCreate(
            ['phone' => $from !== '' ? $from : '+unknown'],
            [
                'name' => 'WhatsApp guest',
                'churn_risk_score' => 0,
            ]
        );

        $guest->forceFill(['last_interaction_at' => now()])->save();

        RunOrchestratorJob::dispatch([
            'type' => 'whatsapp_inbound',
            'payload' => [
                'guest_id' => $guest->id,
                'message' => $body,
                'twilio_from' => (string) $request->input('From', ''),
            ],
        ]);

        return response()->json(['ok' => true]);
    }

    private function normalizePhone(mixed $raw): string
    {
        $s = trim((string) $raw);
        $s = preg_replace('#^whatsapp:#i', '', $s) ?? $s;

        return trim($s);
    }
}
