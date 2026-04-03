# Phase 5 — Orchestrator (steps 36–40)

Minimal reference for the façade that queues and jobs call, and how it ties to the SDK agent and tools.

## Components

| Piece | Role |
|-------|------|
| [`App\Ai\Orchestrator`](../app/Ai/Orchestrator.php) | `handle(array $event)` builds context, runs [`AriaOrchestrator`](../app/Ai/Agents/AriaOrchestrator.php) `prompt()`, dispatches [`AriaActionFired`](../app/Events/AriaActionFired.php), optional incident resolve, returns a summary array. |
| [`App\Ai\Agents\AriaOrchestrator`](../app/Ai/Agents/AriaOrchestrator.php) | Laravel AI SDK agent with `#[MaxSteps(15)]` and ten tools in `tools()` — single source of tool definitions. |
| [`App\Ai\AriaToolRegistry`](../app/Ai/AriaToolRegistry.php) | Maps each tool’s `NAME` constant to the same instances as `AriaOrchestrator`; powers manual `dispatchTool()`. |

## Event shape

```php
[
    'type' => 'guest_message',           // required for logging / broadcast
    'payload' => [
        'guest_id' => '…',               // optional; enables richer context
        'resolve_incident_id' => '…',   // optional; sets incident resolved after a successful handle()
        // …other keys echoed in buildContext and broadcast payload
    ],
]
```

## Return value of `handle()`

- `text` — final assistant text
- `invocation_id` — SDK invocation id
- `tool_calls` / `tool_results` — arrays from the agent response
- `usage` — token usage from the SDK
- `guest_id` — from payload when present

## Context string (`buildContext`)

Always includes local time, timezone, day name, and occupancy (% occupied rooms). With `payload.guest_id`, includes guest profile (VIP, churn, preferences, check-in/out), last 5 incidents, last 10 agent actions, and room row when `room_number` is set.

## Broadcasting

- Event: `AriaActionFired` on private channel `aria` (Echo: `private-aria`), broadcast name `aria.action.fired`.
- Authorization: [`routes/channels.php`](../routes/channels.php) — authenticated users only (`$user !== null`). Tighten for staff roles when you have them.

## Manual tool dispatch

`Orchestrator::dispatchTool(string $name, array $arguments)` and `AriaToolRegistry::run()` use snake_case names matching each tool class’s `NAME` constant (e.g. `send_whatsapp`). Unknown names log a warning and return a JSON error string.

## Tests

[`tests/Feature/PhaseFiveOrchestratorTest.php`](../tests/Feature/PhaseFiveOrchestratorTest.php) — fakes `AriaOrchestrator` for `handle()`, asserts `AriaActionFired`, covers context assembly and `resolve_incident_id`.
