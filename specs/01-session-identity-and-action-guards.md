# 01 — Session identity and action guards

Unblocked. Do this first: everything below that touches permissions assumes it.

## Goal

A signed-in visitor acts as themselves, and nobody acts as nobody. Two observable outcomes: the
workspace names the user who signed in rather than whoever joined first — visible on the settings
pages, which read `currentMember.email` (the account menu was already fed by the session, so it named
the right person even with this bug in place), and a mutation sent without a session leaves the row in
place.

## First increment — shipped

1. `getMemberByUserId(userId)` (`src/db/queries/jkboard.ts`) resolves the caller's membership by the
   unique `member_userId_uidx`, mapped through the same `member ⋈ user` projection the team list uses,
   so "what a member is" has one definition.
2. `src/app/(dashboard)/layout.tsx` calls it with `session.user.id` and hands the row to
   `DashboardShell` → `JkboardProvider` as `currentMember`. `currentMember: members[0]` is gone from
   `src/data/jkboard-store.tsx`; the provider takes it as a prop.
3. A session with no membership gets `WorkspaceAccessNotice` instead of the dashboard. Sign-up normally
   creates both rows (`src/lib/auth.ts:76`), so reaching it means the membership is missing — and the
   alternative was rendering a workspace whose identity belongs to somebody else.
4. `requireMembership()` (`src/db/actions/session.ts`) returns the caller's `member.id` or throws, and is
   awaited first in every mutation: `inviteMemberAction`, `setMemberStatusAction`, `removeMemberAction`,
   `createProjectAction`, `updateProjectAction`, `setProjectStatusAction`, `deleteProjectAction`,
   `createTaskAction`, `updateTaskAction`, `duplicateTaskAction`, `deleteTaskAction`.
   `setTaskStatusAction` inherits it by delegating to `updateTaskAction`. It is a plain server module,
   not `"use server"` — a helper the actions import, not an endpoint of its own.
5. `getMemberId()` is deleted, and `createProjectAction`'s `ownerId` fallback is the caller's id. Its
   unreachable "No workspace member exists yet" branch went with it.

Invariant 7 in `docs/architecture.md` records the rule; `action-revalidation.unit.test.ts` pins it.

## Later increments

- **Per-row ownership, not just per-session.** The destructive actions take a raw id and act on it
  (`deleteProjectAction(projectId)`). Under one shared workspace the honest check
  is "the row exists"; after tenancy it becomes "the row is the caller's". Written here so the guard
  in step 3 is not mistaken for authorization.
- `countOwnedProjects` and `assertMemberExists` (both in `src/db/actions/projects.ts`) exist for exactly
  this purpose and have no callers — grep across `src/`, `scripts/`, `tests/` finds only the string list
  at `tests/platform/unit/action-revalidation.unit.test.ts:48`. Wire them in, or delete both and drop
  them from that list in the same change.
- Brute force and rate limiting on the auth endpoints. **Unverified:** whether Better Auth 1.7.7
  applies any default. Measure before writing this increment.

## Deferred / open questions

- Q1 and Q2 (`docs/product-overview.md:89-92`) decide whether the guard is session-only or
  session-plus-role. Session-only is required under either answer, which is why this spec is not
  blocked.
- Answered by the first increment: no client path sees a null `currentMember`. The two pages that read
  it for display (`settings/account/page.tsx`, `settings/connections/page.tsx`) stay non-null because
  `(dashboard)/layout.tsx` refuses to render `DashboardShell` at all without a membership, and
  `requireMembership()` throws before any action writes. One check, above both surfaces.

## Security / permissions

Single authority is the guard, inside the action. Not `src/proxy.ts`, which only tests cookie
presence (`src/proxy.ts:29`), and not the layout, which guards rendering rather than invocation — a
server action is reachable by POST to the route Next generates for it, from any page or none.

Test: `tests/platform/unit/action-revalidation.unit.test.ts` now asserts it — each mutation reaches the
guard directly or by delegation; a mutation that calls it calls it before its first `db.` access;
`src/db/actions/session.ts` exports the guard alone and is not `"use server"`; and identity arrives from
`getMemberByUserId(session.user.id)` rather than from a position in the member list.
`src/db/actions` holds four modules, asserted in `module-boundaries.unit.test.ts`. Structural proof only
until spec 03 can invoke one with a real database.

## Verification

- `pnpm typecheck` → `pnpm lint` → `pnpm test` → `pnpm build`, in that order
  (`docs/project-context.md` → Commits and PRs). Quote `pnpm test`'s per-tier counts.
- Identity, live in a production build (`next start -p 3100`; `next dev` is not evidence —
  `docs/verification-standards.md`). **Done.** Signed in as `daniel.okafor@jkboard.app`, second by
  `member.joined_at`; `settings/account` rendered "Manage your password and the sign-in details for
  daniel.okafor@jkboard.app" — `currentMember` is the session's member, not `members[0]` (Maya Chen,
  first by `joinedAt`, which is what every caller was shown before). The account menu is not this check;
  it was already session-fed.
- Sessionless call. **Done, but not the way this section first said.** Clearing the cookie is the wrong
  probe: `src/proxy.ts` only checks that `better-auth.session_token` *exists*, and its redirect
  short-circuits the action POST — the response is `200` with a two-byte body and `requireMembership()`
  never runs. The valid probe is a **present-but-unverifiable** cookie, which passes the proxy and
  reaches the action. One real `inviteMemberAction` request was replayed three ways (its `Next-Action`
  id read off the wire, not hand-written):

  | cookie | status | flight digest |
  | --- | --- | --- |
  | absent | 200, 2 bytes | none — refused by the proxy |
  | `better-auth.session_token=forged` | 500 | `2033665256` |
  | a real session | 500 | `2429649290` |

  A production build replaces the message with a digest, so the two refusals are told apart by their
  digests: the forged request threw *before* the duplicate-email check the authenticated one reached.
  That is the guard executing on a request with no verifiable session. `member` and `user` counts re-read
  after the replay: 8 and 8 — every probe wrote nothing, because the invite throws before its insert.
- Still unverified after this: no test has written a row, so the guard's happy path is proven by
  clicking and by one hand-driven replay, not by CI, until spec 03.
