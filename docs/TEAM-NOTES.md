# ARIA — Team notes (implementation summary)

Short reference for what changed in the repo relative to the build guide and product docs. For full detail, see [`ARIA-BUILD-GUIDE.md`](../ARIA-BUILD-GUIDE.md), [`ARIA.md`](../ARIA.md), and [`ARIA — System Design.md`](../ARIA%20%E2%80%94%20System%20Design.md).

## Phase 1 — Foundation (infrastructure)

- **Stack:** Laravel 13 + Inertia + React + Fortify; PostgreSQL-oriented defaults in env templates where applicable.
- **Queue:** Redis queue driver (`predis/predis`) configured for local use.
- **Realtime:** Laravel Reverb installed; Echo + Pusher (`laravel-echo`, `pusher-js`); bootstrap in `resources/js/echo.ts`; `@routes` in `resources/views/app.blade.php` for Ziggy.
- **Integrations (composer):** `laravel/ai` (^0.3), `openai-php/laravel`, `twilio/sdk`, `tightenco/ziggy`, `laravel/reverb`
- **Env:** `OPENAI_*`, `TWILIO_*`, external API keys, Reverb keys in `.env.example` (fill secrets locally).
- **Telescope:** Not compatible with Laravel 13 at the time of setup; use logs / Horizon alternatives later if needed.
- **Dev scripts:** `composer dev` includes `php artisan reverb:start` alongside server, queue, and Vite.

## Phase 2 — Domain data

- **Tables:** `guests`, `rooms`, `bookings`, `incidents`, `agent_actions`, `staff`, `experiences` (UUID PKs except `rooms.number` string PK).
- **Models:** `Guest`, `Booking`, `Incident`, `AgentAction`, `Room`, `Staff`, `Experience` with fillable casts and relationships; `Booking` → `Room` via `room_number`.
- **Seeders:** `RoomSeeder` (80 rooms), `GuestSeeder` (20 guests), `StaffSeeder`, `ExperienceSeeder` (Kuriftu list); wired in `DatabaseSeeder`.
- **Tests:** `tests/Feature/PhaseTwoSchemaTest.php` asserts domain tables exist after migrations (includes Laravel AI `agent_conversations` / `agent_conversation_messages` when those migrations are present).

## Phase 3 — AI core & integration services

- **Laravel AI SDK:** `composer require laravel/ai` (^0.3), publish `Laravel\Ai\AiServiceProvider`, migrate — see [`config/ai.php`](../config/ai.php) (OpenAI `url` uses `OPENAI_BASE_URL` when set).
- **Smoke check:** [`docs/PHASE3-AI-SMOKE.md`](PHASE3-AI-SMOKE.md) (tinker + `agent()`).
- **Services:** `App\Services\TwilioService`, `WeatherService`, `ReviewScraperService` — config under [`config/services.php`](../config/services.php); env keys in [`.env.example`](../.env.example) (`OPENWEATHER_LAT` / `OPENWEATHER_LON`, `GOOGLE_PLACES_PLACE_ID`).
- **Tests:** `tests/Unit/Services/*` (HTTP fakes for weather/reviews; Twilio config / stub behaviour without live API).

## Build guide — AI architecture (Laravel AI SDK)

- **Phase 3** of [`ARIA-BUILD-GUIDE.md`](../ARIA-BUILD-GUIDE.md) was rewritten from a bespoke `OpenAIService` to **Laravel AI SDK** (`laravel/ai`): install, publish config, migrate conversation tables, smoke test with `agent()` / `make:agent`.
- **Phases 4–6** in the guide were aligned: tools as SDK tools with `schema` + `__invoke`, orchestrator as an SDK agent (or thin wrapper) with `tools()` / `prompt()`, sub-agents under `app/Ai/Agents/` where applicable.
- **Conventions:** See [`.cursor/skills/laravel-ai-sdk-guide/SKILL.md`](../.cursor/skills/laravel-ai-sdk-guide/SKILL.md), [`laravel-AI-SDK.md`](../laravel-AI-SDK.md), and [`laravel-AI-SDK-multiagent.md`](../laravel-AI-SDK-multiagent.md).

## Known follow-ups

- Ensure **PostgreSQL** credentials and **Redis** are running before Reverb/queue-heavy flows.
- **Lint:** Exclude generated `resources/js/ziggy.js` from ESLint or regenerate into an ignored path if `npm run lint:check` flags it.

---

*Last updated for internal handoff; adjust dates and checklist items as the project evolves.*
