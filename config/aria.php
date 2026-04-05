<?php

return [

    'demo_triggers_enabled' => (bool) env('ARIA_DEMO_TRIGGERS', false),

    /*
    | Shared secret for the kitchen room-service board. Staff open
    | /kitchen?token=... once per browser session; the session then
    | allows refresh without repeating the token.
    */
    'kitchen_display_token' => (string) env('ARIA_KITCHEN_DISPLAY_TOKEN', ''),

    'kitchen_poll_interval_seconds' => max(5, (int) env('ARIA_KITCHEN_POLL_SECONDS', 15)),

    /*
    | Public /guest/voice kiosk: outbound WhatsApp uses the send_whatsapp tool to this
    | guest UUID only (set after seeding, e.g. a demo guest). Empty = send UI disabled.
    */
    'guest_kiosk_whatsapp_guest_id' => (string) env('GUEST_KIOSK_WHATSAPP_GUEST_ID', ''),

];
