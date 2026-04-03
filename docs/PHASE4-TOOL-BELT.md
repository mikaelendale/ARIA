# Phase 4 — Tool belt (steps 25–35)

Reference for the Laravel AI SDK tool classes, orchestrator wiring, and audit logging.

## Tool summary

| Tool (PHP class) | `tool_called` | Main models / effects | Idempotency |
|------------------|---------------|------------------------|-------------|
| `SendWhatsapp` | `send_whatsapp` | `Guest`, Twilio | No — each call sends a new message. |
| `PingKitchen` | `ping_kitchen` | `Staff` (kitchen), Twilio | No. |
| `AlertManager` | `alert_manager` | `Staff` (management), Twilio | No. |
| `ApplyDiscount` | `apply_discount` | `Incident`, `Guest`, Twilio | No — creates a new incident row per call. |
| `BookExperience` | `book_experience` | `ExperienceBooking`, `Experience`, `Guest`, Twilio | No — creates a new experience booking per call. |
| `AdjustPricing` | `adjust_pricing` | `Room` (all rows of a type), `AgentAction.revenue_impact` | No — reapplies full price to all rooms of that type. |
| `DraftReply` | `draft_reply` | `Incident` (reputation), `DraftReplyAssistant` (LLM) | No — new incident per call. |
| `LogIncident` | `log_incident` | `Incident` | No. |
| `SendPromo` | `send_promo` | `Guest` (segment query), Twilio | No — one `AgentAction` per guest send. |
| `EscalateToHuman` | `escalate_to_human` | `Staff` (reception), `Incident` (optional `escalated`), Twilio | Updating the same incident twice will re-notify staff. |

## SDK contract

- Tools live under `App\Ai\Tools`, implement `Laravel\Ai\Contracts\Tool`, and define `description()`, `handle(Request $request)`, and `schema(JsonSchema $schema)`.
- Generate stubs with `php artisan make:tool Name`.
- Tool `handle()` returns a **string** (JSON in this project: `{ "status": "ok"|"error", ... }`) so callers can parse results consistently.

## Agent actions

- `App\Ai\Support\RecordsAgentActions` creates `agent_actions` rows with `fired_at = now()`, structured `payload`, and optional `guest_id`, `incident_id`, `revenue_impact`.
- Until Phase 5 passes explicit agent context, `agent_name` defaults to **`orchestrator`** (overridable per call via `RecordsAgentActions::record(..., agentName: '...')`).

## Experience bookings vs room `bookings`

- **`bookings`** = room stays (`Guest` + `Room` + dates).
- **`experience_bookings`** = spa / tours / dining (`guest_id`, `experience_id`, `status`, `scheduled_at`, `notes`). The `BookExperience` tool writes here.

## Orchestrator

- `App\Ai\Agents\AriaOrchestrator` implements `Agent`, `Conversational`, and `HasTools`; its `tools()` method returns instances of all ten tools (container-injected).
- Draft replies use `App\Ai\Agents\DraftReplyAssistant` (small dedicated agent) so tests can call `DraftReplyAssistant::fake([...])` without live API keys.

## Smoke (local)

With Twilio and AI configured, you can prompt the orchestrator from a REPL:

```php
use App\Ai\Agents\AriaOrchestrator;

AriaOrchestrator::make()->prompt('Summarize available tools without calling them.');
```

In automated tests, use fakes for Twilio (`TwilioService` binding) and `DraftReplyAssistant::fake([...])` for `DraftReply`.
