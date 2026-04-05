<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use Inertia\Inertia;
use Inertia\Response;

class GuestVoiceController extends Controller
{
    /**
     * Public Hermes kiosk: voice orb + WhatsApp / activity / glance panels.
     */
    public function __invoke(): Response
    {
        $guestId = (string) config('aria.guest_kiosk_whatsapp_guest_id', '');
        $guest = $guestId !== '' ? Guest::query()->find($guestId) : null;

        return Inertia::render('guest-voice', [
            'whatsappKiosk' => [
                'sendEnabled' => $guest !== null,
                'guestLabel' => $guest?->name,
            ],
        ]);
    }
}
