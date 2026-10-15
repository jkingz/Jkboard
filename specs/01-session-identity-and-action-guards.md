# 01 — Session identity and action guards

Unblocked. Do this first: everything below that touches permissions assumes it.

## Goal

A signed-in visitor acts as themselves, and nobody acts as nobody. Two observable outcomes: the
account menu names the user who signed in rather than whoever joined first, and a mutation sent
without a session leaves the row in place.

## First increment

1. Resolve the caller's membership once, server-side. `src/app/(dashboard)/layout.tsx:25` already
   holds `auth.api.getSession({ headers: await headers() })`. Look up `member` by `user_id`, which is
   unique (`member_userId_uidx`, `src/db/schema/members.ts`), and pass the row into `JkboardProvider`.
2. Remove the derivation `currentMember: members[0]` (`src/data/jkboard-store.tsx:326`) in favour of
   that prop. `members[0]` is the earliest `joinedAt` in the table — `getWorkspaceData()` orders by
   `joinedAt` — so it is the same person for every caller.
3. Add one guard for the action layer. **Proposed name `requireMembership()` — no such symbol exists
   yet** — in a new `src/db/actions/session.ts`, built on the same `getSession` call, returning the
   caller's `member.id` or throwing.
4. Call it first in every mutation exported from `src/db/actions/` (the bare filenames below are those
   action files, not the same-named ones in `src/db/schema/`): `inviteMemberAction`
   (`members.ts:45`), `setMemberStatusAction` (`:99`), `removeMemberAction` (`:139`),
   `createProjectAction` (`projects.ts:68`), `updateProjectAction` (`:103`), `setProjectStatusAction`
   (`:143`), `deleteProjectAction` (`:159`), `createTaskAction` (`tasks.ts:62`), `updateTaskAction`
   (`:87`), `duplicateTaskAction` (`:138`), `deleteTaskAction` (`:163`). `setTaskStatusAction` (`:131`)
   delegates to `updateTaskAction` and inherits the guard.
5. Retire `getMemberId()` (`src/db/queries/jkboard.ts:123` — `select … limit(1)`, no `where`) as the
   `ownerId` fallback at `src/db/actions/projects.ts:73`, using the caller's member id instead, then
   delete the function if nothing else calls it.

## Later increments

- **Per-row ownership, not just per-session.** The destructive actions take a raw id and act on it
  (`deleteProjectAction(projectId)`, `projects.ts:159`). Under one shared workspace the honest check
  is "the row exists"; after tenancy it becomes "the row is the caller's". Written here so the guard
  in step 3 is not mistaken for authorization.
- `countOwnedProjects` (`projects.ts:175`) and `assertMemberExists` (`:184`) exist for exactly this
  purpose and have no callers — grep across `src/`, `scripts/`, `tests/` finds only the string list
  at `tests/platform/unit/action-revalidation.unit.test.ts:29`. Wire them in, or delete both and drop
  them from that list in the same change.
- Brute force and rate limiting on the auth endpoints. **Unverified:** whether Better Auth 1.7.7
  applies any default. Measure before writing this increment.

## Deferred / open questions

- Q1 and Q2 (`docs/product-overview.md:89-92`) decide whether the guard is session-only or
  session-plus-role. Session-only is required under either answer, which is why this spec is not
  blocked.
- Whether any client path assumes `currentMember` is never null is unverified. Two read it for
  display: `settings/account/page.tsx` and `settings/connections/page.tsx`.

## Security / permissions

Single authority is the guard, inside the action. Not `src/proxy.ts`, which only tests cookie
presence (`src/proxy.ts:29`), and not the layout, which guards rendering rather than invocation — a
server action is reachable by POST to the route Next generates for it, from any page or none.

Test: extend `tests/platform/unit/action-revalidation.unit.test.ts`, which already enumerates these
exports and their `revalidatePath` calls, to assert each mutation calls the guard too. Structural
proof only until spec 03 can invoke one with a real database.

## Verification

- `pnpm typecheck` → `pnpm lint` → `pnpm test` → `pnpm build`, in that order
  (`docs/project-context.md` → Commits and PRs). Quote `pnpm test`'s per-tier counts.
- Live, in a production build: `next dev` is not evidence (`docs/verification-standards.md`). Sign in
  as a member who is not first by `joinedAt`; the account menu must name that user.
- Sessionless call: clear the cookie and invoke a task delete from the browser, then reload and
  confirm the task survives. A hand-built `curl` needs Next's `Next-Action` header, which is not
  documented in this repo — do not write one until that value is read off a real request.
- Still unverified after this: no test has written a row, so the guard's happy path is proven by
  clicking, not by CI, until spec 03.
