---
description: Test organization, tier definitions, and how to run tests
when: "user needs to write, run, or update tests; asks about test structure, coverage, or mocking"
---

# Testing

## The two tiers

| Tier | Command | Needs |
| --- | --- | --- |
| unit | `pnpm test:unit` | nothing — no DB, no network |
| integration | `pnpm test:integration` | a real `DATABASE_URL` |
| both | `pnpm test` | whatever each tier needs |

Split on disk exactly as split in `vitest.config.mts`:

```
tests/
├── setup-env.ts               loads .env.local for the integration tier
└── platform/
    ├── unit/                  pure selectors + Zod schemas, no DB
    └── integration/           schema invariants, real DB, read-only
```

## What exists today

- **`selectors.unit.test.ts`** — `getTaskStats`, `isOverdue`, `getProjectProgress`, `getWorkload`,
  `getUpcomingTasks`, `getTasksForProject`, and a `daysUntil` regression test.
- **`invariants.integration.test.ts`** — asserts the persistence invariants against
  `information_schema`: the eight declared tables, `member` having no identity columns,
  `reference` being database-generated and unique, and the RESTRICT / SET NULL / CASCADE asymmetry.

The unit tier builds **its own fixtures**. Asserting against the seed arrays in `src/data/jkboard.ts`
would pass even if the logic were inverted.

## Two traps this tier has already hit

**A missing `DATABASE_URL` must never look like a pass.** `hasDatabase()` in
`tests/platform/integration/helpers.ts` also rejects the `.env.example` placeholder, not just an
absent value — that file exists in every fresh clone, so checking presence alone reports a usable
database when there is none. When the tier skips, it prints the reason.

**Vitest does not read `.env.local`.** `tests/setup-env.ts` exists solely to load it. Delete that file
and the integration tier silently skips while still looking green.

## Writing tests here

- Import through the `@/` alias, never relatively.
- Build dates with UTC helpers. The app derives every date from UTC (`toISODate`, and `date` columns
  carry no timezone), so a fixture built from local time will pass or fail depending on the machine.
  This is not hypothetical — a UTC-derived fixture is what exposed the `daysUntil` bug.
- `db.execute()` returns a driver result object, **not** an array. Use `rowsOf(result)` from
  `tests/platform/integration/helpers.ts`; calling `.map()` on the result directly throws
  `rows.map is not a function`.
- Never import `@/db` in a test: it is `server-only`, whose entry point throws outside a React Server
  Component graph. Use `testDb()` from the integration helpers instead.

## Coverage requirements

Every route gets a test covering `401` / `403` / `400` and the no-data-before-auth path.

FlowBoard has **no HTTP routes** for projects or tasks — all mutations are server actions under
`src/db/actions/`. The equivalent test is: an unauthenticated caller cannot invoke the action. There
is currently **nothing enforcing that**; see [docs/target-state.md](../../docs/target-state.md).

Ownership/isolation needs a two-tenant fixture proving a foreign id cannot be read. FlowBoard has a
single workspace, so that test would fail today — which is the point.

## Empty or credential-gated tiers

Report which tier a run actually covered. `pnpm test` prints both counts; a skipped integration tier
appears as a skip, not as a silent pass.

## What's NOT tested yet

Invariants 1, 4 and 5 in [docs/architecture.md](../../docs/architecture.md) — the `server-only`
guarantee, that every mutation revalidates, and the proxy redirect rule. All three need a running app
or a browser. The server actions are also untested behaviourally: the integration tier is read-only.