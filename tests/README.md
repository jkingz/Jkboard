# Tests

Two tiers, split on disk exactly as split in `vitest.config.mts`:

```
tests/
├── setup-env.ts                        loads .env.local for the integration tier
└── platform/
    ├── unit/                           no DB, no network
    │   ├── helpers.ts                  reads the src/ tree: sourceFiles, importsOf, functionBody
    │   ├── selectors.unit.test.ts      the pure selectors, on hand-built fixtures
    │   ├── dates.unit.test.ts          formatDate / dateFromToday / daysUntil on a pinned clock
    │   ├── view-model.unit.test.ts     enum ↔ catalogue ↔ class / icon ↔ schema coherence
    │   ├── demo-account.unit.test.ts   isDemoEnvironment() truth table + what the flag implies
    │   ├── error-message.unit.test.ts  errorMessage, including the blank-toast case
    │   ├── proxy.unit.test.ts          invariant 5, calling proxy() with real NextRequests
    │   ├── module-boundaries.unit.test.ts   invariant 1: server-only imports, by file
    │   └── action-revalidation.unit.test.ts invariant 4: every mutation revalidates
    └── integration/                    real DATABASE_URL, read-only
        ├── helpers.ts                  testDb, hasDatabase, rowsOf, skipReason
        ├── invariants.integration.test.ts       invariants 2, 3, 6 + table existence
        └── column-contracts.integration.test.ts declared defaults, enums, indexes, nullability
```

There is no `e2e/` tier. Nothing covers the interface; `docs/verification-standards.md` records that
the UI was verified by clicking it, not by a test.

## Test organization

- **Two tiers** — `unit`, `integration`. A third is added when something needs it, not before.
- **Nothing beside the module** — tests never live next to source files.
- **Import through aliases** — `@/db/schema`, never `../../src/db/schema`.

## Tier definitions

- **unit** — no database, no network. Two kinds live here, and they fail differently:
  - *behavioural*: call a function, assert what it returned. Builds its own fixtures — asserting
    against the seed arrays in `src/data/jkboard.ts` would pass even if the logic were inverted.
  - *structural*: read the source tree and assert the rule still holds textually. These are what make
    invariants 1 and 4 CI-visible without a browser. They catch the edit that breaks the rule and
    nothing else, and a matcher that finds zero files passes silently — so each one carries a
    non-vacuity assertion (`clientModules.length > 80`, the 12 action names pinned by hand). If you
    weaken a structural test, check it still goes red before you check it goes green.
- **integration** — needs a real `DATABASE_URL`. Currently read-only: it asserts persistence
  invariants and column contracts against `information_schema` and inserts nothing.

The one deliberate exception to "builds its own fixtures" is `view-model.unit.test.ts`, which reads
the seed `projects` / `members` / `tasks` arrays. It has to: `projectProgressSeries` and
`teamWorkload` are computed from those arrays at module load, so the seeds are the only possible
input. It asserts the derivation matches, which is not the same as asserting the selectors work —
that is what the hand-built fixtures in `selectors.unit.test.ts` are for.

## Running tests

See [../docs/project-context.md](../docs/project-context.md) → Commands.

| Need | Command |
| --- | --- |
| Both tiers | `pnpm test` |
| Unit only | `pnpm test:unit` |
| Integration only | `pnpm test:integration` |
| One file | `pnpm test:unit tests/platform/unit/selectors.unit.test.ts` |

**A skipped tier is not a pass.** `pnpm test` prints both counts, and the integration tier prints
the reason it skipped. Report which tier a run covered.

## Traps this setup has already hit

- **Vitest does not read `.env.local`.** `setup-env.ts` exists only to load it. Delete that file and
  the integration tier silently skips while still looking green.
- **`hasDatabase()` rejects the `.env.example` placeholder**, not just an absent value. That file
  exists in every fresh clone, so presence alone reports a usable database when there is none.
- **`db.execute()` returns a driver result object, not an array.** Use `rowsOf()`; calling `.map()`
  on the result throws `rows.map is not a function`.
- **Never import `@/db` in a test.** It is `server-only` and throws outside a React Server
  Component graph. Use `testDb()`.
- **Build dates with UTC helpers.** A local-time fixture passes or fails depending on the machine.
- **Pinning the clock is not pinning the zone.** `vi.setSystemTime` freezes the instant while
  `Date`'s local getters keep following the machine, so a helper that mixes UTC and local calendars
  still flakes. `dates.unit.test.ts` sets `process.env.TZ` *and* fake timers, and `afterEach` deletes
  `TZ` again — leak it and every later test in the file runs in the leaked zone.
- **Index names are exactly as declared, camelCase and all.** The schema writes
  `index("task_projectId_status_idx")`, so that is what `pg_indexes.indexdef` returns. Asserting a
  lowercased `task_projectid_status_idx` — the obvious guess — fails against a real database.
- **A structural matcher can pass by finding nothing.** `sourceFiles()` returns `[]` for a path typo
  and every `every()` over it is then trivially true. Each structural file asserts its own non-empty
  result; add that assertion before the rule it guards.
- **`it.fails` is an assertion, not a TODO.** `dates.unit.test.ts` pins the `dateFromToday` /
  `daysUntil` mismatch that way. Fix the mismatch and that test starts *failing* — the correct action
  is to flip it to `it`, not delete it. An `it.todo` would never catch the fix.

## Adding tests

- New behavior gets a new test in the same change.
- Every route gets `401` / `403` / `400` and a no-data-before-auth path. There is no HTTP route for
  projects or tasks — the equivalent is a server action, and **nothing authorises one**.
  `proxy.unit.test.ts` proves the redirect rule in `src/proxy.ts` and says nothing about an action
  called with no session, which is still open in `column-contracts.integration.test.ts` as `it.todo`.
- Ownership or tenancy needs a two-tenant fixture proving a foreign id cannot be read. Jkboard has a
  single workspace, so that test would fail today — which is the point.
- Writing a row means the integration tier stops being read-only. That is a decision, not an
  escalation: it needs its own database, or a transaction that never commits. Nothing here does it
  against the shared demo instance.
- Verify moves by count, not by color: record totals before and after.

See [../docs/target-state.md](../docs/target-state.md) for what is deliberately untested.