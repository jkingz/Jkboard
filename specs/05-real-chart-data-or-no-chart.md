# 05 — No invented numbers in the interface

Unblocked. Cheapest phase on this list, and the one a visitor notices.

## Goal

Nothing on a dashboard surface presents data that was never in the database. Specifically: the Task
completion chart either reflects real tasks or is gone.

## Why it is open

`src/app/(dashboard)/dashboard/components/overview-charts.tsx:30` imports `taskCompletionTrend`,
which is twelve hardcoded weeks in `src/data/jkboard.ts:531-543` (`{ week: "W1", completed: 12,
created: 15 }` …), rendered inside a `Card` whose description reads "Tasks completed against tasks
created" (`overview-charts.tsx:49-55`). The database behind that chart is real: `task.completed_at` (`src/db/schema/tasks.ts:65`) is written by
`createTaskAction` (`src/db/actions/tasks.ts:77`) and kept in step by `updateTaskAction` (`:112-114`),
and `created_at` is a column on the table. Neither reaches the client, which is the actual reason the
series is hardcoded rather than merely stale.

The landing page has its own copy of this: `src/app/landing/components/product-preview.tsx:33`
imports the seed arrays and `projectProgressSeries` from `src/data/jkboard.ts`.

## First increment

1. Close the gap that makes this chart fake in the first place: **the timestamps it needs never reach
   the client.** `taskSchema` (`src/data/jkboard.ts:61-72`) has no `createdAt` or `completedAt`, and
   the task projection in `getWorkspaceData()` (`src/db/queries/jkboard.ts:93-103`) selects neither,
   so `useJkboard().tasks` cannot tell a completion week from a creation week. Two ways to fix that —
   add both columns to `taskSchema` and the projection (it is only read for the `Task` type and by
   `tests/platform/unit/view-model.unit.test.ts`, so widening it is low-risk), or aggregate the series
   in SQL and pass it as a separate prop from `layout.tsx:31`. Prefer the second if a full-table
   weekly aggregate is acceptable; prefer the first if the selector should stay pure and testable.
2. Build the weekly completed/created series from whichever of those lands, as a pure selector in
   `src/data/jkboard.ts` so it joins the functions already covered by
   `tests/platform/unit/selectors.unit.test.ts`.
3. Handle the empty workspace: a brand-new account has no tasks, and a chart of nothing must not
   render twelve fabricated weeks or crash. Decide which, then assert it in a unit test.
4. For `/landing`: keep the preview if it is labelled a preview. That page already went through an
   honest-claims pass (`b7f55f3`); the question is only whether the preview says so.

## Later increments

- Audit the remaining exports of `src/data/jkboard.ts` that are shaped like data rather than like
  code — `docs/target-state.md` → "Removing the seed arrays" describes the residue, not the whole
  module: the store no longer seeds from those arrays, it hydrates from `getWorkspaceData()` through
  `initialData` (`src/data/jkboard-store.tsx:129-139`, `src/app/(dashboard)/layout.tsx:31`).
- `task.description` is written by both task actions and read nowhere
  (`docs/architecture.md` → Persistence schema). Either render it or stop writing it.

## Deferred / open questions

- Whether the chart should show four or twelve weeks of history when real data is thinner than the
  range selector offers. Not a code question.

## Security / permissions

Not a permissions change. It is a truth claim: the dashboard is the product's own account of the
workspace, and a stored series that no query produced breaks that.

## Verification

- `pnpm test` → the new selector needs a fixture with known `completedAt` values and an empty case.
- Gate chain, then live in a production build: complete a task, reload `/dashboard`, the series must
  move. If it does not move, the chart is still reading the array.
- Unverified: how the chart behaves with a single task and with a task completed in a week the range
  selector does not cover.
