# Phase 3 — Laravel AI SDK smoke check

After `OPENAI_API_KEY` is set in `.env` and migrations have run:

```bash
php artisan tinker
```

```php
use function Laravel\Ai\agent;

$response = agent('You reply with exactly one word: pong.')->prompt('ping');
$response->text;
```

Expect a short reply (e.g. `pong`). For CI and automated tests, use `Agent::fake()` and related helpers from [`laravel-AI-SDK.md`](../laravel-AI-SDK.md) instead of calling the live API.

Integration services (no LLM):

- `App\Services\TwilioService` — requires `TWILIO_*` env vars for real sends.
- `App\Services\WeatherService` — requires `OPENWEATHER_KEY` (optional lat/lon via `OPENWEATHER_LAT` / `OPENWEATHER_LON`).
- `App\Services\ReviewScraperService` — Google reviews need `GOOGLE_PLACES_KEY` and `GOOGLE_PLACES_PLACE_ID`; TripAdvisor path is stubbed.
