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

];
