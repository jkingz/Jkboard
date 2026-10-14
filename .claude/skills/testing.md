---
description: Test organization, tier definitions, and how to run tests
when: "user needs to write, run, or update tests; asks about test structure, coverage, or mocking"
---

# Testing

## Current state: no runner

**Nothing runs.** There is no test dependency in `package.json` and no `tests/` directory. This skill
describes the convention to follow *when a runner is added* — it is not a description of today.

The first candidates are the six invariants in [docs/architecture.md](../../docs/architecture.md),
which are currently unverified:

1. `server-only` holds — no client component imports the db
2. `member` has no identity columns; name/email come from joining `user`
3. `task.reference` is database-generated
4. every mutation calls `revalidatePath("/", "layout")`
5. `proxy.ts` never redirects a session-bearing request away from `/sign-in`
6. project ownership transfers before member deletion (`ON DELETE RESTRICT`)

Invariants 2, 3 and 6 are unit-testable against a real database with no browser. Start there.

## Organization

Tests live in `tests/{feature}/{tier}/` — one folder per feature, tiers `unit`, `integration`, `e2e`.
Nothing collocated beside the module.

```
tests/
  tasks/
    unit/
    integration/
  members/
    integration/
```

## Import patterns

- Import the subject through the `@/` alias, **never relatively**
- Check dynamic forms: `await import("./x")` is invisible to a `from "\./"` pattern
- Example: `import { createTaskAction } from "@/db/actions/tasks"`

## Mocking

- **Mock at the boundary only** — here that means `@/db`, the module that owns all I/O
- Never mock inside business logic
- Unit tier only; integration and e2e use the real Neon database

`src/db/index.ts` throws at import if `DATABASE_URL` is unset, and is marked `server-only`. Any test
touching it needs `.env.local` loaded — use the same `node --env-file=.env.local` wrapper the `db:*`
scripts use.

## Running tests

No commands exist yet. Once a runner lands, record them in
[docs/project-context.md](../../docs/project-context.md) → Commands and in the gate chain there.

Prove "run one file" by passing a path that must match nothing; the runner must say it collected
nothing. If it runs everything and exits 0, the argument never reached the runner.

## Coverage requirements

Every route gets a test covering:
- `401` (unauthenticated)
- `403` (forbidden)
- `400` (bad request)
- **No-data-before-auth path** — verify the handler checks auth before reading data

Note that FlowBoard has **no HTTP routes** for projects or tasks — all mutations are server actions
under `src/db/actions/`. The equivalent test is: an unauthenticated caller cannot invoke the action,
and there is currently **nothing enforcing that**. See
[docs/target-state.md](../../docs/target-state.md).

Ownership/isolation needs a two-tenant fixture proving a foreign id cannot be read. FlowBoard has a
single workspace, so this test would fail today — that is the point.

## Empty or credential-gated tiers

Opt-in and empty tiers exit 0 — report which tier the run actually covered. A suite that collected
zero files and exited 0 is not a pass.

## What's NOT tested yet

Everything.

## Reference

- [docs/project-context.md](../../docs/project-context.md) → Verification gates, for why the chain has
  no test step
- [docs/architecture.md](../../docs/architecture.md) → Invariants, the list above
- [docs/verification-standards.md](../../docs/verification-standards.md) before writing any doc here