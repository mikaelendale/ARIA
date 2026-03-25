# ARIA Team Assignment (Phase 3 to Phase 11)

## Team

- `@mike`
- `@fuad`
- `@nahoml`

## Ownership Split

### `@mike` — AI Core and Agent Intelligence

- **Phase 3:** Laravel AI SDK foundation and integration services
- **Phase 5:** Orchestrator
- **Phase 6:** Sub-Agents

**Why this fits:** These phases are the AI brain and decisioning core, so one owner keeps architecture and agent behavior consistent.

---

### `@fuad` — Tooling, Background Execution, Real-Time Events

- **Phase 4:** Tool Belt
- **Phase 7:** Jobs
- **Phase 8:** Events and Broadcasting

**Why this fits:** These phases are execution plumbing (tools, queues, broadcasts) and need tight backend reliability and observability.

---

### `@nahom` — Integrations, Product Surface, Demo Delivery

- **Phase 9:** Webhooks and Controllers
- **Phase 10:** Frontend Dashboard
- **Phase 11:** Demo Preparation

**Why this fits:** These phases convert backend behavior into user-visible flows and demo polish, from inbound webhooks to live UI and final runbook.

---

## Dependency and Handoff Order

- `@mike` starts **Phase 3** first so SDK foundations are ready.
- `@fuad` starts **Phase 4** right after core services from Phase 3 are usable.
- `@mike` moves to **Phase 5** and **Phase 6** once tools from Phase 4 are available.
- `@fuad` runs **Phase 7** and **Phase 8** while sub-agents are being finalized.
- `@nahom` takes **Phase 9** when orchestrator/jobs/events are stable, then completes **Phase 10** and **Phase 11**.

## Support Pairing (Secondary Reviewer)

- `@mike` reviews AI-related logic in Phases 4, 9
- `@fuad` reviews queue/event reliability in Phases 5, 6, 10
- `@nahom` reviews UX/demo flow in Phases 8, 10, 11

## Quick Weekly Structure (Optional)

- **Day 1-2:** Phase 3 + early Phase 4
- **Day 3-4:** Phases 5-6 + 7
- **Day 5:** Phases 8-9 integration
- **Day 6:** Phase 10
- **Day 7:** Phase 11 full dry runs

---

If needed, convert this into a task board format next (per-step assignment from Step 21 to Step 75 with checkboxes).