<?php

namespace App\Http\Controllers;

use App\Ai\Tools\SendWhatsapp;
use App\Models\Guest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Ai\Tools\Request as ToolRequest;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class GuestKioskWhatsappController extends Controller
{
    /**
     * Send WhatsApp via the same {@see SendWhatsapp} tool as the orchestrator.
     * Recipient is fixed to {@see config('aria.guest_kiosk_whatsapp_guest_id')} (kiosk demo channel).
     */
    public function __invoke(Request $request, SendWhatsapp $sendWhatsapp): JsonResponse
    {
        $guestId = (string) config('aria.guest_kiosk_whatsapp_guest_id', '');
        if ($guestId === '' || ! Guest::query()->whereKey($guestId)->exists()) {
            return response()->json([
                'message' => 'WhatsApp send is not configured for this kiosk.',
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1600'],
        ]);

        try {
            $raw = $sendWhatsapp->handle(new ToolRequest([
                'guest_id' => $guestId,
                'message' => $validated['message'],
            ]));
        } catch (Throwable) {
            return response()->json([
                'message' => 'Could not send WhatsApp.',
            ], Response::HTTP_BAD_GATEWAY);
        }

        $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

        if (($data['status'] ?? '') !== 'ok') {
            return response()->json([
                'message' => is_string($data['message'] ?? null) ? $data['message'] : 'Could not send WhatsApp.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json([
            'twilio_sid' => $data['twilio_sid'] ?? null,
            'guest_id' => $data['guest_id'] ?? null,
        ]);
    }
}
