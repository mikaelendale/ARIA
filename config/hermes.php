<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Hermes (voice) — OpenAI Realtime + Twilio
    |--------------------------------------------------------------------------
    |
    | Full duplex audio requires a long-lived WebSocket worker (often Node or a
    | dedicated service). PHP entrypoints here validate webhooks and delegate.
    |
    */

    'realtime' => [
        'model' => env('HERMES_REALTIME_MODEL', 'gpt-4o-realtime-preview'),
        'url' => env('HERMES_REALTIME_URL', 'wss://api.openai.com/v1/realtime'),
    ],

    'audio' => [
        'input_format' => 'g711_ulaw',
        'vad_mode' => 'server_vad',
    ],

    'languages' => [
        'primary' => 'en',
        'secondary' => 'am',
    ],

];
