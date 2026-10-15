# 03 — Integration tests that write rows

Unblocked in principle; **blocked in practice on owner permission to write to a database that is not
the working one**, and on a decision about which database that is.

## Goal

Something other than a browser has proven a server action writes the right row. Today nothing has:
both integration files query `information_schema`, `pg_indexes`, `pg_type` and `pg_class` and insert
nothing, so `pnpm test` passing says nothing about `createTaskAction`.

## First increment

1. A disposable target. A Neon branch off the existing project is the obvious candidate —
   **unverified:** whether branching is enabled here, and whether the placeholder `DATABASE_URL` in
   `.env.example` is the only non-secret variable that would need a real value.
2. A second variable (name to be chosen and then recorded in `docs/project-context.md` → Environment)
   so the scratch URL never shadows the working `DATABASE_URL`. `tests/setup-env.ts` loads
   `.env.local`, which is where the working URL lives. Note the obstacle this creates: every `db:*`
   script in `package.json:15-19` hardcodes `--env-file=.env.local`, so seeding and migrating the
   scratch database needs either a changed script or a separate env file — decide which before
   writing the fixture, not during.
3. A fixture that truncates the app tables and reseeds from `scripts/seed-data.ts`, which already
   exports the row shapes and builds dates on the UTC calendar (`scripts/seed-data.ts:14`).
4. Four tests, replacing the `it.todo` entries in
   `tests/platform/integration/column-contracts.integration.test.ts:232-236`:
   - `createTaskAction` writes a row that `getWorkspaceData()` reads back.
   - A payload that fails the Zod parse is rejected — `updateTaskAction` calls
     `taskInputSchema.partial().parse()` (`src/db/actions/tasks.ts:91`).
   - Deleting a project cascades to its tasks (`task.project_id` is `on delete cascade`) and
     deleting a member nulls `task.assignee_id` rather than removing the task.
   - The spec 01 guard refuses a sessionless call — the only way to test that guard for real.

## Later increments

- The `on delete restrict` half of invariant 6: removing a member who still owns a project must fail,
  which today is asserted only as a constraint in `information_schema`.
- A test for `task.reference` coming from `task_reference_seq` under concurrent inserts.

## Deferred / open questions

- Whether these run in CI is spec 04, not decided here.
- Truncate or transaction-and-rollback: rollback is faster and leaves nothing behind, but needs the
  action's `db` handle to share the transaction, which it does not today. Do not assume it works.

## Security / permissions

This spec writes rows and nothing else. It must never be pointed at the database the demo visitors
use — the one `DATABASE_URL` in `.env.local` — because deleting demo data is how the landing page's
credentials stop being a demo.

## Verification

- `pnpm test:integration` → quote what it *collected*, per the row in
  `docs/verification-standards.md` about a green tier that ran nothing.
- `pnpm test` → both tiers reported separately.
- `pnpm typecheck`, `pnpm lint` — the integration files are type-checked.
- Live check is not needed for tests-only work, but the first time a write test exists, compare its
  result against doing the same action in the browser once, to prove the test exercises the real path.
- What remains unverified: the client's reaction to a rejection, which needs spec 06.
