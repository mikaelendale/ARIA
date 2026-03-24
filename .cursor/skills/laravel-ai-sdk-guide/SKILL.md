---
name: laravel-ai-sdk-guide
description: Implements Laravel AI SDK features using project conventions for agents, tools, structured output, and multi-agent orchestration. Use when building or modifying AI workflows, agent classes, SDK tools, streaming/queue flows, embeddings/vector stores, or AI-related tests in this repository.
---

# Laravel AI SDK Guide

## Goal

Apply the documented Laravel AI SDK patterns from `Laravel-AI-SDK.md` and `laravel-AI-SDK-multiagent.md` when writing AI features in this codebase.

## Default Build Path

1. Start with the simplest workable approach (`agent()` or a single agent class).
2. Move to dedicated agent classes when logic is reusable, stateful, or tested.
3. Add `schema` for machine-consumed responses (branching, persistence, automation).
4. Introduce tools only for external actions / side effects and define strict tool schemas.
5. Choose orchestration pattern only when complexity requires it.

## Pattern Selector

- **Prompt Chaining**: fixed sequence (generate -> validate -> improve -> format).
- **Routing**: classify first, then dispatch by type/complexity.
- **Parallelization**: independent specialist tasks run concurrently, then synthesize.
- **Orchestrator-Workers**: orchestrator delegates to worker tools/sub-agents dynamically.
- **Evaluator-Optimizer**: quality loop with measurable approval criteria and max iterations.

## Implementation Rules

- Keep instructions explicit and role-bound; avoid multi-purpose mega-prompts.
- Use `HasStructuredOutput` or `schema` closure whenever code reads named fields.
- Prefer SDK attributes for model/provider tuning (`Provider`, `Model`, `MaxSteps`, `Timeout`, `UseCheapestModel`, `UseSmartestModel`).
- Use failover provider arrays for resilience on critical paths.
- Add middleware for observability (prompt/response logging) when behavior matters.
- Use `stream()` for realtime UX and `queue()` for non-blocking background processing.

## Data and Retrieval

- Use embeddings + similarity search for app data RAG scenarios.
- Use provider `FileSearch` only when files are already in vector stores.
- Attach metadata to stored files to enable targeted `where` filtering.

## Testing Contract

- Fake all AI boundaries in tests (`Agent::fake`, `Image::fake`, `Embeddings::fake`, etc.).
- Use `preventStray*` methods to prevent accidental real provider calls.
- Assert prompted/queued behavior and expected tool/file/store interactions.

## Output Expectations For This Repo

- Return production-ready PHP/Laravel code (not pseudocode) unless explicitly requested.
- Include migration/model/test updates when AI changes affect data flow.
- Prefer safe defaults (timeouts, bounded loops, explicit limits on tool usage).
