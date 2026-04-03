# Phase 6 — Sub-agents (steps 41–47)

## Schema

| Addition | Purpose |
|----------|---------|
| `guests.date_of_birth` | Sentinel birthday check |
| `room_service_orders` | Delayed room service detection |
| `restaurant_visits` | “No restaurant visit” Sentinel rule + Vera heuristics |
| `incidents.review_fingerprint` (unique) | Echo review deduplication |

Migration: `database/migrations/2026_03_28_140000_phase6_sub_agents_schema.php`.

## Agents

| Class | Role |
|-------|------|
| [`SentinelAgent`](../app/Ai/Agents/SentinelAgent.php) | Periodic checks → [`Orchestrator::handle`](../app/Ai/Orchestrator.php) per condition |
| [`NexusAgent`](../app/Ai/Agents/NexusAgent.php) | Wraps events with NEXUS ops context string |
| [`PulsePricingAgent`](../app/Ai/Agents/PulsePricingAgent.php) | SDK agent, tools: `adjust_pricing`, `send_promo` only |
| [`PulseAgent`](../app/Ai/Agents/PulseAgent.php) | Occupancy/weekend prompt → `PulsePricingAgent` |
| [`VeraAgent`](../app/Ai/Agents/VeraAgent.php) | `updateScore(Guest)` churn 0–100; escalates via `guest_churn_risk_high` |
| [`EchoAgent`](../app/Ai/Agents/EchoAgent.php) | Reviews → incidents + low-rating orchestrator runs |
| [`HermesAgent`](../app/Ai/Agents/HermesAgent.php) | Voice **stub**; production needs Realtime WebSocket worker + Twilio Media Streams |

## Hermes / voice

Bidirectional audio between Twilio and OpenAI Realtime is **not** implemented in PHP-FPM. Use a dedicated worker (Node, Go, etc.), validate Twilio webhooks in Laravel, and forward tool calls to the same [`Orchestrator`](../app/Ai/Orchestrator.php) contract as text flows.

Config reference: [`config/hermes.php`](../config/hermes.php).

## Tests

[`tests/Feature/PhaseSixSubAgentsTest.php`](../tests/Feature/PhaseSixSubAgentsTest.php)

## Scheduling

Queued jobs that call these agents are **Phase 7** (`RunSentinelJob`, etc.).
