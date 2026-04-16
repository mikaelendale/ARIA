<?php

return [

    /*
    | When false (default), RunSentinelJob / RunEchoJob / RunPulseJob are not registered on the
    | scheduler — avoids automatic AI calls; use dashboard/API triggers or manual dispatch instead.
    */
    'enable_scheduled_ai_jobs' => filter_var(
        env('ARIA_ENABLE_SCHEDULED_AI_JOBS', false),
        FILTER_VALIDATE_BOOLEAN,
    ),

    'demo_triggers_enabled' => (bool) env('ARIA_DEMO_TRIGGERS', false),

    /*
    | Shared secret for the kitchen room-service board. Staff open
    | /kitchen?token=... once per browser session; the session then
    | allows refresh without repeating the token.
    */
    'kitchen_display_token' => (string) env('ARIA_KITCHEN_DISPLAY_TOKEN', ''),

    'kitchen_poll_interval_seconds' => max(5, (int) env('ARIA_KITCHEN_POLL_SECONDS', 15)),

    /*
    | When set (e.g. 21), the overview only counts non-resolved issues created within this many days.
    | Useful for demo/stage DBs with large historical incident tables. Null = all time.
    */
    'dashboard_open_incident_lookback_days' => ($v = env('ARIA_DASHBOARD_OPEN_INCIDENT_LOOKBACK_DAYS')) !== null && $v !== ''
        ? max(1, (int) $v)
        : null,

    /*
    | Public /guest/voice kiosk: outbound WhatsApp uses the send_whatsapp tool to this
    | guest UUID only (set after seeding, e.g. a demo guest). Empty = send UI disabled.
    */
    'guest_kiosk_whatsapp_guest_id' => (string) env('GUEST_KIOSK_WHATSAPP_GUEST_ID', ''),

];
