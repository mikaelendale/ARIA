<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Dashboard incident / maintenance banner
    |--------------------------------------------------------------------------
    |
    | Non-empty string: shown at the top of the authenticated dashboard.
    | Set DASHBOARD_INCIDENT_BANNER= in .env to hide after the incident is resolved.
    |
    */
    'incident_banner' => env(
        'DASHBOARD_INCIDENT_BANNER',
        'We are deeply sorry. Our OpenAI API keys were exhausted, and we are rotating to new keys right now. '
        .'You may run into delays, errors, or missing AI features while we finish the change. '
        .'We know this is frustrating and apologize for the inconvenience.',
    ),

];
