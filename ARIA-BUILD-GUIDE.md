# ARIA — Step by Step Build Guide
## Hyper detailed. One thing at a time. No skipping.

---

## PHASE 1 — Project Setup

### Step 1 — Create the Laravel project
- Open your terminal
- Navigate to where you want the project to live
- Run the Laravel installer to create a new project called `aria`
- Wait for it to finish
- Open the project in your code editor

### Step 2 — Set up PostgreSQL database
- Open pgAdmin or your PostgreSQL client
- Create a new database called `aria`
- Note your database username and password
- Open the `.env` file in your project root
- Set `DB_CONNECTION` to `pgsql`
- Set `DB_HOST` to `127.0.0.1`
- Set `DB_PORT` to `5432`
- Set `DB_DATABASE` to `aria`
- Set `DB_USERNAME` to your postgres username
- Set `DB_PASSWORD` to your postgres password
- Test the connection by running migrations — if it works, the connection is good

### Step 3 — Install Laravel Breeze with Inertia + React
- In your terminal, require Laravel Breeze via composer
- Run the Breeze install command and choose the Inertia React option
- Run npm install to pull all frontend dependencies
- Run the database migrations so the users table and auth tables are created
- Run `npm run dev` and `php artisan serve` together and visit the app in your browser
- Confirm you can see the login and register pages — this means Inertia and React are wired correctly

### Step 4 — Install and configure Redis
- Make sure Redis is installed on your machine and running
- Install the predis package via composer
- Open your `.env` file
- Set `QUEUE_CONNECTION` to `redis`
- Set `REDIS_HOST` to `127.0.0.1`
- Set `REDIS_PORT` to `6379`
- Open `config/queue.php` and confirm the redis connection is pointing to your Redis instance
- Test it by running `php artisan queue:work` in a terminal — if it starts without errors, Redis is connected

### Step 5 — Install and configure Laravel Reverb
- Require the Laravel Reverb package via composer
- Run the Reverb install artisan command — this publishes the config file
- Open `config/reverb.php` and note the default app id, key, and secret
- Copy those values into your `.env` file under `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`
- Set `BROADCAST_CONNECTION` in `.env` to `reverb`
- Install the frontend packages — laravel-echo and pusher-js via npm
- Run Reverb server with `php artisan reverb:start` and confirm it starts on port 8080
- This is your WebSocket server — keep it running alongside queue worker and vite during development

### Step 6 — Install Laravel Telescope (dev tool)
- Require Laravel Telescope via composer as a dev dependency
- Run the Telescope install artisan command
- Run migrations again so Telescope tables are created
- Visit `/telescope` in your browser and confirm you can see the dashboard
- This is how you will watch your queued jobs, events, and logs during development

### Step 7 — Install OpenAI PHP package
- Require the openai-php/laravel package via composer
- Run the vendor publish command to publish the OpenAI config file
- Open your `.env` file
- Add your `OPENAI_API_KEY` with your actual key from platform.openai.com
- Add `OPENAI_ORGANIZATION` if you have one, otherwise leave it blank

### Step 8 — Install Twilio SDK
- Require the twilio/sdk package via composer
- Open your `.env` file
- Add `TWILIO_SID` with your Account SID from twilio.com console
- Add `TWILIO_AUTH_TOKEN` with your auth token
- Add `TWILIO_PHONE_NUMBER` with your Twilio number including country code
- Add `TWILIO_WHATSAPP_FROM` as `whatsapp:` followed by your Twilio WhatsApp number

### Step 9 — Add external API keys to .env
- Add `OPENWEATHER_KEY` from openweathermap.org
- Add `GOOGLE_PLACES_KEY` from Google Cloud console with Places API enabled
- Add `AVIATIONSTACK_KEY` from aviationstack.com free tier
- Save the file

### Step 10 — Set up Ziggy for route sharing
- Require the tightenco/ziggy package via composer
- Add the Ziggy service provider to your app
- Add the Ziggy component to your root Inertia layout so frontend can use named Laravel routes

---

## PHASE 2 — Database & Models

### Step 11 — Create the guests migration
- Generate a new migration called `create_guests_table`
- Open the migration file
- Add a `uuid` primary key column called `id`
- Add a string column called `name`
- Add a string column called `phone` — this is their WhatsApp number
- Add a string column called `email` — nullable
- Add a string column called `language_preference` — default to `en`
- Add a string column called `nationality` — nullable
- Add an integer column called `churn_risk_score` — default to 0
- Add a boolean column called `is_vip` — default to false
- Add a json column called `preference_tags` — nullable — this stores things like spa_user, vegetarian
- Add a string column called `room_number` — nullable
- Add a timestamp column called `checked_in_at` — nullable
- Add a timestamp column called `checked_out_at` — nullable
- Add a timestamp column called `last_interaction_at` — nullable
- Add standard `timestamps()`

### Step 12 — Create the bookings migration
- Generate a new migration called `create_bookings_table`
- Add a `uuid` primary key
- Add a foreign uuid column `guest_id` referencing guests table
- Add a string column `room_number`
- Add a string column `room_type`
- Add a timestamp `check_in_date`
- Add a timestamp `check_out_date`
- Add a string `status` — values will be: pending, active, completed, cancelled
- Add a decimal `total_amount`
- Add standard `timestamps()`

### Step 13 — Create the incidents migration
- Generate a new migration called `create_incidents_table`
- Add a `uuid` primary key
- Add a foreign uuid column `guest_id` — nullable — not every incident is tied to a guest
- Add a string column `type` — values: complaint, delay, maintenance, churn_risk, revenue, reputation
- Add a string column `trigger_source` — values: sentinel, hermes, echo, staff, manual
- Add a string column `severity` — values: low, medium, high, critical
- Add a text column `description`
- Add a json column `context` — stores the raw event data that triggered the incident
- Add a string column `status` — values: open, in_progress, resolved, escalated
- Add a string column `resolved_by` — values: aria, staff, manager
- Add an integer column `resolution_time_seconds` — nullable
- Add a timestamp `resolved_at` — nullable
- Add standard `timestamps()`

### Step 14 — Create the agent_actions migration
- Generate a new migration called `create_agent_actions_table`
- Add a `uuid` primary key
- Add a foreign uuid column `incident_id` — nullable
- Add a foreign uuid column `guest_id` — nullable
- Add a string column `agent_name` — values: orchestrator, sentinel, hermes, nexus, pulse, vera, echo
- Add a string column `tool_called` — the name of the tool function that fired
- Add a json column `payload` — the arguments passed to the tool
- Add a string column `status` — values: fired, delivered, failed
- Add a text column `result` — nullable — what came back from the tool
- Add a decimal column `revenue_impact` — nullable — ETB value of the action
- Add a timestamp `fired_at`
- Add standard `timestamps()`

### Step 15 — Create the rooms migration
- Generate a new migration called `create_rooms_table`
- Add a string primary key `number`
- Add a string column `type` — values: standard, deluxe, suite, villa
- Add a string column `status` — values: available, occupied, cleaning, maintenance
- Add a decimal column `base_price`
- Add a decimal column `current_price` — PULSE changes this
- Add a boolean column `is_occupied` — default false
- Add standard `timestamps()`

### Step 16 — Create the staff migration
- Generate a new migration called `create_staff_table`
- Add a `uuid` primary key
- Add a string column `name`
- Add a string column `phone` — WhatsApp number for ARIA to ping
- Add a string column `department` — values: kitchen, housekeeping, maintenance, spa, reception, management
- Add a string column `role`
- Add a boolean column `is_available` — default true
- Add standard `timestamps()`

### Step 17 — Create the experiences migration
- Generate a new migration called `create_experiences_table`
- Add a `uuid` primary key
- Add a string column `name`
- Add a string column `category` — values: spa, dining, tour, activity, transfer
- Add a text column `description`
- Add a decimal column `price`
- Add an integer column `duration_minutes`
- Add a boolean column `is_available` — default true
- Add standard `timestamps()`

### Step 18 — Run all migrations
- Run `php artisan migrate` and confirm all tables were created in your PostgreSQL database
- Open your database client and verify every table exists with the correct columns

### Step 19 — Create all Eloquent models
- Generate a Guest model
- Generate a Booking model
- Generate an Incident model
- Generate an AgentAction model
- Generate a Room model
- Generate a Staff model
- Generate an Experience model
- Open each model file and define the `$fillable` array with every column from its migration
- On the Guest model, cast `preference_tags` as an array
- On the Incident model, cast `context` as an array
- On the AgentAction model, cast `payload` as an array
- Define the relationships — Guest hasMany Bookings, Guest hasMany Incidents, Incident hasMany AgentActions

### Step 20 — Create database seeders
- Create a GuestSeeder that generates 20 fake guests with realistic Ethiopian names, phone numbers, and room assignments
- Create a RoomSeeder that generates 80 rooms across all types with base prices
- Create a StaffSeeder that creates staff members for each department
- Create an ExperienceSeeder with Kuriftu-specific experiences: Lake Tana Boat Tour, Ethiopian Coffee Ceremony, Spa Package, Pool Villa Upgrade, Dinner at Kuriftu Restaurant
- Run all seeders and confirm data is in the database

---

## PHASE 3 — Laravel AI SDK foundation & integration services

ARIA’s “brain” is implemented with the **Laravel AI SDK** (`laravel/ai`), not a bespoke HTTP wrapper around OpenAI. Follow the project skill [`.cursor/skills/laravel-ai-sdk-guide/SKILL.md`](.cursor/skills/laravel-ai-sdk-guide/SKILL.md) and the in-repo docs [`laravel-AI-SDK.md`](laravel-AI-SDK.md) and [`laravel-AI-SDK-multiagent.md`](laravel-AI-SDK-multiagent.md) for agents, tools, structured output, streaming, queues, and tests.

**Default build path (same order as the skill):** start with the `agent()` helper or a single generated agent class → move to dedicated agent classes when logic is reusable or testable → add `schema` when another part of the app must read named fields → add SDK **tools** only for side effects (Twilio, DB writes, pricing) with strict tool schemas → introduce orchestration patterns (prompt chaining, routing, parallelization, orchestrator–workers, evaluator–optimizer) only when complexity requires it.

**Testing:** fake AI boundaries in tests (`Agent::fake`, `preventStrayRequests`, etc. per `laravel-AI-SDK.md` Testing). Do not rely on live API calls in CI.

Phases 4–6 below assume **SDK agents and tools**; they replace the older idea of a hand-written `OpenAIService` that called the REST API directly.

### Step 21 — Install and configure the Laravel AI SDK
- Require the package: `composer require laravel/ai`
- Publish config and provider: `php artisan vendor:publish --provider="Laravel\Ai\AiServiceProvider"`
- Run migrations so the SDK can persist conversations: `php artisan migrate` (creates `agent_conversations` / `agent_conversation_messages` as documented in `laravel-AI-SDK.md`)
- Copy provider keys into `.env` — at minimum `OPENAI_API_KEY` (see `config/ai.php` after publish). You can keep Phase 1 `OPENAI_*` variables aligned with the same keys so `openai-php/laravel` (if present) and `config/ai.php` stay in sync
- Set default text model in `config/ai.php` to what ARIA uses for orchestration (e.g. a current OpenAI GPT-4 class model appropriate for tool calling)
- Smoke test: from `php artisan tinker`, run a minimal prompt using the `agent()` helper **or** an agent class created with `php artisan make:agent` (see Agents section in `laravel-AI-SDK.md`) and confirm you get a text response
- Optional: generate a stub orchestrator-facing agent with `php artisan make:agent AriaOrchestrator` — full wiring happens in Phase 5; this step only proves the SDK is live

### Step 22 — Create TwilioService
- Create a new file at `app/Services/TwilioService.php`
- Inject the Twilio SDK client in the constructor using your env credentials
- Write a method called `sendWhatsapp` that accepts a phone number and a message string and sends it via the Twilio WhatsApp API
- Write a method called `sendSms` that does the same but plain SMS — used for staff alerts
- Write a method called `makeCall` for future use — just a stub for now
- Test `sendWhatsapp` from tinker by sending a message to your own WhatsApp number and confirming it arrives

### Step 23 — Create WeatherService
- Create a new file at `app/Services/WeatherService.php`
- Write a method called `getForecast` that hits the OpenWeatherMap API with Kuriftu's coordinates
- Parse the response and return a simple array with: is_rain_tomorrow (boolean), temperature, and condition string
- Cache the result for 1 hour using Laravel Cache so you don't hammer the API

### Step 24 — Create ReviewScraperService
- Create a new file at `app/Services/ReviewScraperService.php`
- Write a method called `getGoogleReviews` that calls the Google Places API with Kuriftu's place ID and returns an array of reviews each with: author, rating, text, and date
- Write a method called `scrapeTripadvisor` — for now this can return a hardcoded set of sample reviews since TripAdvisor blocks scrapers. You will swap this for real scraping or an API later
- Write a method called `getAllReviews` that calls both methods and merges the results into a single array

---

## PHASE 4 — Tool Belt

### Step 25 — Create the Tools directory and base structure
- Create a folder for SDK tools (e.g. `app/Ai/Tools/` if you use `php artisan make:tool` / the same namespace as `make:agent`, or `app/Ai/Tools/` if you standardise the folder name — **stay consistent** with PSR-4 in `composer.json`)
- Each tool is a **Laravel AI SDK** tool class implementing the SDK contract: it exposes a **`schema(JsonSchema $schema)`** for arguments and an **`__invoke`** (or equivalent) implementation that performs the side effect — see **Tools** in [`laravel-AI-SDK.md`](laravel-AI-SDK.md)
- Register each tool on the orchestrator agent’s `tools()` method (or pass them into `agent()` when prototyping) instead of maintaining a parallel array of raw OpenAI JSON tool definitions
- Side effects: persist to `agent_actions`, call `TwilioService`, update `rooms`, etc. Keep tool descriptions aligned with the product tool belt in [`ARIA.md`](ARIA.md)

### Step 26 — Build SendWhatsapp tool
- Create `app/Ai/Tools/SendWhatsapp.php` (or your chosen namespace)
- Define the tool name and schema so the model sees `send_whatsapp` with parameters `guest_id` and `message` (both required) — match the SDK Tool pattern, not only a static OpenAI array
- Implement the tool’s `__invoke` (or a thin `execute` called from it) with guest_id and message
- It looks up the guest phone number from the database using guest_id
- It calls TwilioService `sendWhatsapp` with that number and the message
- It logs the action to agent_actions table
- It returns a success or failure status

### Step 27 — Build PingKitchen tool
- Create `app/Ai/Tools/PingKitchen.php`
- Schema: name `ping_kitchen`, description "Alert kitchen staff about a delayed or urgent order", parameters with `order_description` string and `room_number` string
- Execute: find the kitchen staff member marked as available from the staff table
- Send them a WhatsApp alert via TwilioService with the room number and issue
- Log the action
- Return status

### Step 28 — Build AlertManager tool
- Create `app/Ai/Tools/AlertManager.php`
- Schema: name `alert_manager`, description "Escalate a critical issue to the hotel manager", parameters with `issue` string, `severity` string, and `guest_id` optional string
- Execute: find staff with department `management` from the staff table
- Send WhatsApp alert with full issue description
- Log the action
- Return status

### Step 29 — Build ApplyDiscount tool
- Create `app/Ai/Tools/ApplyDiscount.php`
- Schema: name `apply_discount`, description "Apply a discount or compensation to a guest", parameters with `guest_id` string, `amount` number, `reason` string
- Execute: find the guest, create a discount record in the incidents table as context, send the guest a WhatsApp message informing them of the discount
- Log the action with revenue_impact set to negative of the discount amount
- Return status

### Step 30 — Build BookExperience tool
- Create `app/Ai/Tools/BookExperience.php`
- Schema: name `book_experience`, description "Book an experience for a guest", parameters with `guest_id` string and `experience_name` string
- Execute: find the experience by name from the experiences table
- Create a booking record
- Send the guest a WhatsApp confirmation
- Log the action
- Return status

### Step 31 — Build AdjustPricing tool
- Create `app/Ai/Tools/AdjustPricing.php`
- Schema: name `adjust_pricing`, description "Adjust room prices based on occupancy or demand", parameters with `room_type` string, `new_price` number, `reason` string
- Execute: update current_price on all rooms of that type in the rooms table
- Calculate revenue delta vs base price
- Log the action with revenue_impact set to the delta
- Return status and the calculated impact

### Step 32 — Build DraftReply tool
- Create `app/Ai/Tools/DraftReply.php`
- Schema: name `draft_reply`, description "Draft a management response to a guest review", parameters with `review_text` string and `rating` number
- Execute: prompt a small **Laravel AI SDK** agent (or `agent()` one-off) with instructions for a professional management reply — no separate `OpenAIService`; use the same provider/model defaults as in `config/ai.php`
- Store the draft in the incidents table as context
- Log the action
- Return the drafted reply text

### Step 33 — Build LogIncident tool
- Create `app/Ai/Tools/LogIncident.php`
- Schema: name `log_incident`, description "Log an issue or event to the incident record", parameters with `type` string, `description` string, `severity` string, and `guest_id` optional string
- Execute: create a new incident record in the database with status open
- Log the action
- Return the new incident id

### Step 34 — Build SendPromo tool
- Create `app/Ai/Tools/SendPromo.php`
- Schema: name `send_promo`, description "Send a promotional offer to past or current guests", parameters with `message` string and `target` string — target values: all_current, past_guests, vip_only
- Execute: query guests based on target — current guests by checked_in_at, past guests by checked_out_at, vips by is_vip flag
- Loop through and send each guest a WhatsApp message via TwilioService
- Log each send as a separate agent action
- Return how many messages were sent

### Step 35 — Build EscalateToHuman tool
- Create `app/Ai/Tools/EscalateToHuman.php`
- Schema: name `escalate_to_human`, description "Hand off a situation to a human staff member", parameters with `reason` string, `incident_id` optional string, and `guest_id` optional string
- Execute: find the most available reception staff member
- Send them a WhatsApp with full context
- Update the incident status to `escalated` if incident_id provided
- Log the action
- Return status

---

## PHASE 5 — Orchestrator

### Step 36 — Create the Orchestrator (SDK agent or service)
- Prefer an **orchestrator agent class** under `app/Ai/Agents/` (e.g. `AriaOrchestrator`) implementing `Laravel\Ai\Contracts\Agent` and `HasTools`, **or** a thin `app/Ai/Orchestrator.php` service that wraps `(new AriaOrchestrator)->prompt(...)` / `agent(...)` — see [`laravel-AI-SDK.md`](laravel-AI-SDK.md) Agents
- This is the master brain — everything flows through it
- Expose a method called `handle` that accepts an event array with type and payload (your queued jobs call this)
- Register all ARIA tool classes on this agent’s `tools()` method

### Step 37 — Build context assembly in Orchestrator
- Inside `handle`, write a private method called `buildContext`
- This method takes the event and builds a rich user message (or system augmentation) for the orchestrator model
- If the event has a guest_id, load the guest with their last 5 incidents and last 10 agent actions
- Include current room status, churn score, VIP flag, and preferences
- Include the current time, day of week, and occupancy percentage
- Return a formatted string (or structured prelude) so the model has full situational awareness

### Step 38 — Tools registration (no parallel JSON definitions)
- The orchestrator agent’s `tools()` method returns instances of your 10 tool classes — the **Laravel AI SDK** turns them into provider tool definitions; you do **not** maintain a duplicate `getToolDefinitions()` array unless you are prototyping
- Optionally use `#[Model]`, `#[MaxSteps]`, or middleware on the agent for timeouts and observability (see Agent Configuration in `laravel-AI-SDK.md`)

### Step 39 — Tool execution
- The SDK invokes tools when the model requests them; implement each tool’s `__invoke` to run side effects (DB, Twilio, etc.)
- If you need a manual path (e.g. replay), keep a private `dispatchTool` that maps tool name → tool class and invokes it — but prefer the SDK’s built-in tool loop
- If a tool name is not registered, log and fail safely

### Step 40 — Wire the full Orchestrator handle method
- In `handle`, call `buildContext` and pass it to the orchestrator agent via `->prompt(...)` (and use `->stream()` or `->queue()` if you need streaming or background processing — see SDK docs)
- Let the SDK run the tool round-trip until the model finishes or `MaxSteps` is reached
- After tools run, broadcast an `AriaActionFired` event via Laravel broadcasting
- Update the incident status to `resolved` if applicable
- Return a summary of what was done

---

## PHASE 6 — Sub-Agents

### Step 41 — Create the Agents directory
- Create a folder at `app/Ai/Agents/` (or generate agents with `php artisan make:agent`)
- Sub-agents can be SDK `Agent` classes with focused `instructions()` and optional `schema()` / tools, **or** thin services whose `run()` delegates to `Orchestrator->handle()` with a structured event

### Step 42 — Build SentinelAgent
- Create `app/Ai/Agents/SentinelAgent.php`
- Write the `run` method
- Inside, check for room service delays — query orders older than 35 mins with status not delivered, for each one call Orchestrator with type `room_service_delayed`
- Check for housekeeping misses — query rooms with status `cleaning` where updated_at is older than 30 mins past checkout time
- Check occupancy — count occupied rooms divided by total rooms, if above 80% call Orchestrator with type `occupancy_threshold_crossed`
- Check guest radio silence — query guests checked in more than 6 hours ago with last_interaction_at null
- Check guest birthdays — query guests where dob day and month matches today
- Check no restaurant visit — query guests on Day 2+ with no F&B booking
- For every condition found, build a structured event and call Orchestrator

### Step 43 — Build NexusAgent
- Create `app/Ai/Agents/NexusAgent.php`
- Write the `run` method that accepts an event
- Use SDK `instructions()` / agent prompt text that defines NEXUS as the operations agent
- Call Orchestrator `handle` with the event and Nexus-specific context
- NEXUS focuses on: routing to correct staff, tracking SLAs, communicating with guests about operational issues

### Step 44 — Build PulseAgent
- Create `app/Ai/Agents/PulseAgent.php`
- Write the `run` method
- Check current occupancy percentage
- Check if it is a weekend
- Use a **Laravel AI SDK** agent with tools `adjust_pricing`, `send_promo` (and any upsell tool you define) — pass pricing and occupancy in the prompt so the model decides whether to raise prices, lower them, or send a promo
- Let the SDK execute tool calls (or call `Orchestrator->handle()` which already wraps the tool-enabled agent)

### Step 45 — Build VeraAgent
- Create `app/Ai/Agents/VeraAgent.php`
- Write a method called `updateScore` that accepts a guest and recalculates their churn score
- The score increases when: guest has an unresolved complaint, guest hasn't interacted in 4+ hours, guest ignored a WhatsApp message, guest has no service usage on Day 2+
- The score decreases when: guest books an experience, guest responds to a message, guest orders room service, guest visits the restaurant
- Save the new score to the guest record
- If score crosses 70, call Orchestrator with type `guest_churn_risk_high`

### Step 46 — Build EchoAgent
- Create `app/Ai/Agents/EchoAgent.php`
- Write the `run` method
- Call ReviewScraperService to get all recent reviews
- For each new review not already in the database, store it as an incident with type `reputation`
- If rating is 3 or below, call Orchestrator with type `negative_review_posted` including the review text
- Orchestrator will use the SDK orchestrator agent to draft a reply and send a recovery WhatsApp

### Step 47 — Build HermesAgent
- Create `app/Ai/Agents/HermesAgent.php`
- This agent is different — it is invoked by the Twilio webhook, not the scheduler
- Write a method called `handleIncomingCall` that accepts the Twilio webhook payload
- Write a method called `openRealtimeSession` that opens a WebSocket connection to the OpenAI Realtime API
- Write the session config with: Amharic + English bilingual instructions, all tool definitions, server VAD for turn detection, g711_ulaw audio format
- Write the audio stream bridge that reads audio from Twilio and writes it to OpenAI, and reads audio from OpenAI and writes it back to Twilio
- Write the tool call handler — when OpenAI fires a tool_call during a voice session, call Orchestrator the same way as any other agent
- Write the call end handler — save the full transcript to the incidents table

---

## PHASE 7 — Jobs

### Step 48 — Create RunOrchestratorJob
- Generate a new queued job called `RunOrchestratorJob`
- It accepts an event array in the constructor
- In the `handle` method, instantiate Orchestrator and call `handle` with the event
- Set the queue to `aria-core`

### Step 49 — Create RunSentinelJob
- Generate a new queued job called `RunSentinelJob`
- In the `handle` method, instantiate SentinelAgent and call `run`
- Set the queue to `aria-sentinel`
- This job runs every 60 seconds via the scheduler

### Step 50 — Create agent jobs for the rest
- Create `RunNexusJob` — accepts an event, calls NexusAgent `run`
- Create `RunPulseJob` — calls PulseAgent `run` with current occupancy data
- Create `RunVeraJob` — accepts a guest_id, calls VeraAgent `updateScore` for that guest
- Create `RunEchoJob` — calls EchoAgent `run` — runs every 30 mins
- Each job goes on a named queue so you can prioritize them separately

### Step 51 — Register all jobs in the scheduler
- Open `app/Console/Kernel.php` or your routes/console.php file
- Schedule `RunSentinelJob` to run every minute
- Schedule `RunEchoJob` to run every 30 minutes
- Schedule `RunPulseJob` to run every hour
- Make sure `php artisan schedule:run` is in your development workflow

---

## PHASE 8 — Events & Broadcasting

### Step 52 — Create AriaActionFired event
- Generate a new broadcastable event called `AriaActionFired`
- It accepts an agent_action model in the constructor
- Implement `ShouldBroadcast`
- The `broadcastOn` method returns a public channel called `aria-live`
- The `broadcastWith` method returns: agent name, tool called, guest name if applicable, result message, revenue impact, fired_at timestamp, status

### Step 53 — Create supporting events
- Create `GuestChurnFlagged` event — broadcasts when VERA flags a guest above score 70
- Create `IncidentResolved` event — broadcasts when an incident is closed
- Create `PricingAdjusted` event — broadcasts when PULSE changes room prices
- Each one implements `ShouldBroadcast` and broadcasts on the `aria-live` channel

### Step 54 — Register broadcast channels
- Open `routes/channels.php`
- Register the `aria-live` channel as public — anyone on the dashboard can listen
- Register a private `manager` channel for manager-only alerts

---

## PHASE 9 — Webhooks & Controllers

### Step 55 — Create WebhookController
- Generate a new controller called `WebhookController`
- Write a method called `twilioVoice` — this receives inbound call webhooks from Twilio
- It reads the CallSid and From number from the request
- It finds or creates the guest by phone number
- It returns TwiML that opens a media stream to your WebSocket endpoint
- Write a method called `twilioWhatsapp` — receives inbound WhatsApp messages
- It reads the From number and Body from the request
- It finds the guest by phone number
- It dispatches a `RunOrchestratorJob` with type `whatsapp_inbound` and the message text
- It returns a 200 response immediately — the reply will come async from the agent

### Step 56 — Register webhook routes
- Open `routes/web.php`
- Add POST routes for `/webhook/twilio/voice` and `/webhook/twilio/whatsapp`
- Exclude these routes from CSRF verification in your middleware — Twilio cannot send a CSRF token

### Step 57 — Create DashboardController
- Generate a DashboardController
- Write an `index` method that loads the last 20 agent actions, current occupancy percentage, total revenue impact today, and number of open incidents
- Pass all of this to the Inertia response for the dashboard page

### Step 58 — Create GuestController
- Write an `index` method that returns all guests ordered by churn_risk_score descending
- Write a `show` method that returns a single guest with their bookings, incidents, and agent actions

### Step 59 — Create IncidentController
- Write an `index` method that returns all incidents ordered by created_at descending
- Write a `show` method that returns a single incident with all its agent actions in order

### Step 60 — Create a demo trigger endpoint
- Add a POST route at `/api/trigger/scenario`
- This accepts a scenario name in the request body
- For scenario `room_delay` — find a random active guest and dispatch RunOrchestratorJob with a room service delay event
- For scenario `angry_tweet` — dispatch with a negative social mention event for that guest
- For scenario `occupancy_spike` — update 70 rooms to occupied status then dispatch PulseAgent
- This endpoint is only for the demo — disable it after the hackathon

---

## PHASE 10 — Frontend Dashboard

### Step 61 — Set up Laravel Echo in React
- Open your root app layout file
- Import Echo and Pusher
- Configure Echo to use the Reverb driver with your Reverb host and port from env
- Export the Echo instance so any component can import and use it
- Test it by opening the browser console and checking that Echo connected without errors

### Step 62 — Create the Dashboard page
- Create `resources/js/Pages/Dashboard/Index.jsx`
- This is the main command center page
- It has three sections: a top stats bar, a live action feed on the left, and a right panel for churn board and revenue
- Load the initial data from the Inertia page props passed by DashboardController

### Step 63 — Build the ActionFeed component
- Create `resources/js/Components/ActionFeed.jsx`
- It accepts an initial array of actions as a prop
- On mount, open an Echo channel subscription to `aria-live`
- Listen for `AriaActionFired` events
- When one comes in, prepend it to the local actions state so new items appear at the top
- Render each action as a card showing: agent name, tool that fired, message, timestamp, and revenue impact if any
- Color the left border of each card by agent: nexus is blue, pulse is green, vera is purple, echo is amber, hermes is teal

### Step 64 — Build the AgentStatusBadge component
- Create `resources/js/Components/AgentStatusBadge.jsx`
- Shows a small dot and name for each of the 6 sub-agents
- Green dot means the agent ran in the last 2 minutes
- Yellow means it ran between 2 and 10 minutes ago
- Red means it hasn't run in over 10 minutes
- Pull the last run time from the agent_actions table via a quick API call on mount

### Step 65 — Build the LiveCounter component
- Create `resources/js/Components/LiveCounter.jsx`
- Displays the total ETB revenue impact of all PULSE actions today
- Animates the number when it updates — count up smoothly from old value to new value
- Listen on the Echo channel for `PricingAdjusted` events and update the counter when they arrive

### Step 66 — Build the ChurnScoreBar component
- Create `resources/js/Components/ChurnScoreBar.jsx`
- Accepts a score from 0 to 100
- Renders a thin progress bar
- Color is green from 0 to 40, yellow from 40 to 70, red from 70 to 100
- Shows the guest name above and the score number next to the bar

### Step 67 — Build the Guest pages
- Create `resources/js/Pages/Guests/Index.jsx` — a table of all guests sorted by churn score with a ChurnScoreBar for each
- Create `resources/js/Pages/Guests/Show.jsx` — full guest profile showing: personal details, current booking, churn score, preference tags, and a timeline of every ARIA action taken for this guest

### Step 68 — Build the Incident pages
- Create `resources/js/Pages/Incidents/Index.jsx` — list of all incidents with status badges and resolution time
- Create `resources/js/Pages/Incidents/Show.jsx` — single incident showing the full timeline of every tool that fired, in order, with timestamps

---

## PHASE 11 — Demo Preparation

### Step 69 — Script and test Scenario 1: Room service delay
- Manually create an order record with a timestamp 40 minutes ago and status pending
- Trigger the sentinel manually via your demo endpoint
- Watch the action feed — confirm NEXUS fires ping_kitchen, alert_manager, and send_whatsapp within 30 seconds
- Confirm the WhatsApp message actually arrives on your phone
- Repeat until it works clean every single time

### Step 70 — Script and test Scenario 2: Angry tweet
- Trigger the demo endpoint with scenario `angry_tweet`
- Confirm ECHO picks it up, the orchestrator agent drafts a reply, and sends a recovery WhatsApp
- Confirm it appears in the action feed

### Step 71 — Script and test Scenario 3: Occupancy spike and pricing
- Trigger the demo endpoint with scenario `occupancy_spike`
- Watch PULSE raise prices on the dashboard
- Confirm the LiveCounter updates with a positive revenue delta
- Confirm the PricingAdjusted event broadcasts and the dashboard shows the new price

### Step 72 — Script and test Scenario 4: Guest churn flag
- Manually set a guest's churn score to 72 in the database
- Trigger VeraAgent for that guest
- Confirm Orchestrator receives the churn_risk_high event
- Confirm a recovery WhatsApp fires to the guest
- Confirm it appears in the action feed

### Step 73 — Script and test Scenario 5: Live voice call
- Call your Twilio number from your real phone
- Speak in English: "I have been waiting for my room service for an hour"
- Confirm HERMES responds naturally and says it is handling the issue
- Confirm the call action appears live on the dashboard while you are still on the call
- Test again in Amharic — ask a question in Amharic and confirm HERMES responds in Amharic
- Repeat until it sounds natural and the dashboard sync is reliable

### Step 74 — Run all 5 scenarios back to back without touching the keyboard
- This is the actual demo run — no fixing things mid-demo
- Time yourself — it should fit cleanly in 3 minutes leaving 1 minute for the pitch words
- If anything breaks, fix it now, not on stage

### Step 75 — Final check — make everything look real
- Replace all seeded guest names with realistic Ethiopian names
- Make sure the room numbers match real Kuriftu room types
- Make sure the WhatsApp messages sound professional and warm, not robotic
- Set the dashboard to dark mode if it looks better — commanders use dark mode
- Open the dashboard on the largest screen available for the presentation
- Make sure Reverb, queue worker, and the scheduler are all running before you walk on stage

---

*ARIA Build Guide v1.0 — 75 steps. Build in order. Ship everything.*
