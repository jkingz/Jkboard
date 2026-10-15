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
    ├── unit/                  no DB, no network
    └── integration/           schema contracts, real DB, read-only
```

Per-file map of the tree lives in [`tests/README.md`](../../tests/README.md) — read it rather than
re-listing files here, and update that file when the tree changes.

## What exists today

The kinds of test in the repo, ordered by how much each can actually prove:

| Kind | Files | What it proves |
| --- | --- | --- |
| behavioural, on fixtures | `selectors`, `dates`, `error-message` | the function returned the right thing |
| behavioural, in-process | `proxy` | `proxy()` redirects the way invariant 5 requires, over the paths it is given |
| coherence over the source | `view-model`, `demo-account` | enum ↔ catalogue ↔ class/icon ↔ Zod schema agree, and the demo env flag's truth table is what people think it is |
| structural, on the text | `module-boundaries`, `action-revalidation` | invariants 1 and 4 still hold in the files — catches the edit that breaks the rule, nothing else |
| schema metadata | `invariants`, `column-contracts` | the deployed database matches the declared schema: defaults, enums, indexes, nullability, delete rules |

The unit tier builds **its own fixtures**. Asserting against the seed arrays in `src/data/jkboard.ts`
would pass even if the logic were inverted; the one file that reads those arrays
(`view-model.unit.test.ts`) has to, because `projectProgressSeries` and `teamWorkload` are computed
from them at module load.

## Two traps this tier has already hit

**A missing `DATABASE_URL` must never look like a pass.** `hasDatabase()` in
`tests/platform/integration/helpers.ts` also rejects the `.env.example` placeholder, not just an
absent value — that file exists in every fresh clone, so checking presence alone reports a usable
database when there is none. When the tier skips, it prints the reason.

**Vitest does not read `.env.local`.** `tests/setup-env.ts` exists solely to load it. Delete that file
and the integration tier silently skips while still looking green.

These two are the ones that make a green run lie. The full list — including the traps that bite while
writing rather than while reading — is in
[`tests/README.md`](../../tests/README.md) → Traps this setup has already hit.

## Writing tests here

- Import through the `@/` alias, never relatively.
- Build dates with UTC helpers. The app derives every date from UTC (`toISODate`, and `date` columns
  carry no timezone), so a fixture built from local time will pass or fail depending on the machine.
  This is not hypothetical — a UTC-derived fixture is what exposed the `daysUntil` bug.
- Pinning the clock is not pinning the zone. `vi.setSystemTime` freezes the instant but `Date`'s local
  getters keep following the machine; set `process.env.TZ` as well, and `delete` it in `afterEach` or
  the leaked zone silently applies to every later test in the file.
- `db.execute()` returns a driver result object, **not** an array. Use `rowsOf(result)` from
  `tests/platform/integration/helpers.ts`; calling `.map()` on the result directly throws
  `rows.map is not a function`.
- Never import `@/db` in a test: it is `server-only`, whose entry point throws outside a React Server
  Component graph. Use `testDb()` from the integration helpers instead.
- Assert index names exactly as the schema declares them — `task_projectId_status_idx`, camelCase and
  all. The lowercased guess does not exist in `pg_indexes`.
- A structural test whose matcher finds nothing passes forever. Assert the match count before the rule
  it guards.
- Use `it.fails`, not `it.todo`, for a defect you have reproduced but are not fixing in this change.
  It goes red when someone fixes it, which is the signal to flip it; a `todo` never notices.

## Coverage requirements

Every route gets a test covering `401` / `403` / `400` and the no-data-before-auth path.

Jkboard has **no HTTP routes** for projects or tasks — all mutations are server actions under
`src/db/actions/`. The equivalent test is: an unauthenticated caller cannot invoke the action. There
is currently **nothing enforcing that**; see [docs/target-state.md](../../docs/target-state.md).

Ownership/isolation needs a two-tenant fixture proving a foreign id cannot be read. Jkboard has a
single workspace, so that test would fail today — which is the point.

## Empty or credential-gated tiers

Report which tier a run actually covered. `pnpm test` prints both counts; a skipped integration tier
appears as a skip, not as a silent pass.

## What's NOT tested yet

Invariants 1, 4 and 5 all have tests now — 1 and 4 structurally in the unit tier, 5 by calling
`proxy()` directly in-process. None needed a browser, contrary to what this section used to claim.
What is still uncovered:

- **Server action behaviour.** No test has written a row. The integration tier is read-only, so
  `createTaskAction` etc. are verified to *exist and revalidate*, never to produce the right data.
- **Authorization.** Nothing checks a session before running an action; `getMemberId()` and the
  hardcoded `currentMember = members[0]` in the store are the same hole. Recorded as `it.todo` in
  `column-contracts.integration.test.ts`.
- **Any of the interface.** No `e2e/` tier exists. `pnpm test` never renders a component.
- **Invariant 6 behaviourally.** `ON DELETE RESTRICT` on `owner_id` is asserted as a constraint;
  nothing exercises a member who owns a project being removed.
- **A defect pinned, not fixed.** `dateFromToday` builds dates on the local calendar while
  `daysUntil` reads them on the UTC one; `dates.unit.test.ts` holds that open with an `it.fails`, so
  the mismatch is visible in the report instead of silent. Fixing it flips that test.