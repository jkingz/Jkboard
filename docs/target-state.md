# Target State — Not Yet Built

Design intent that is **not** implemented. Treat this file as requirements for future work, **never**
as a description of current behavior.

The rule that keeps this file honest: nothing here may be cited as a fact about the running system.
If a line would be a lie if quoted out of context, it belongs in this file, or nowhere.

---

## Per-user workspace scoping

**Why:** `getMemberId()` (`src/db/queries/flowboard.ts:123`) returns the first `member` row and
`currentMember` is hardcoded to `members[0]` (`src/data/flowboard-store.tsx:308`), so every
signed-in user sees and mutates one shared workspace. Real scoping needs the session's `user.id`
threaded into every query.

**Blocked by:** an owner decision on whether one shared workspace is the intended product — see
[product-overview.md](./product-overview.md) → Open product questions.

**Done when:** two signed-in users see different data, proven by a test that fails today.

---

## Authorization on mutations

**Why:** no server action under `src/db/actions/` checks a session or a role. `member.role` is a
free-text column nothing branches on. Any authenticated session can delete any project by id. The
actions are shielded from anonymous callers only by the `(dashboard)` route tree and `src/proxy.ts`,
not by the actions themselves — so an action called from anywhere else is fully open.

**Blocked by:** the same owner decision as scoping, plus a role model (`role` is currently free text
with default `"Member"`).

**Done when:** each action verifies the caller and their permission against `member`, with the
unauthorized case covered by a test.

---

## A test runner

**Why:** there is no vitest/jest/playwright dependency and no `tests/` directory, so
[project-context.md](./project-context.md) → Verification gates has no test step and the six
invariants in [architecture.md](./architecture.md) are unverified.

**Blocked by:** nothing — it is unstarted.

**Done when:** a runner exists, `pnpm test` is the first gate, and at least invariants 2, 3 and 6 are
covered.

---

## A hermetic build

**Why:** Inter is fetched from Google at build time (`src/lib/fonts.ts`). A cold build with no egress
exits 1. Gate 3 cannot be trusted on any sealed runner.

**Blocked by:** vendoring the font, or accepting and testing the fallback.

**Done when:** `rm -rf .next && NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:9 pnpm build`
exits 0.

---

## Email on invite

**Why:** `inviteMemberAction` writes the `user` + `member` rows and stops. Nothing is sent, so the
invitee must already know to sign in.

**Blocked by:** an owner decision on whether email is the intended flow — see
[product-overview.md](./product-overview.md).

**Done when:** an invited address receives a usable sign-in link.

---

## CI

**Why:** there is no `.github/` directory and no remote, so the gate chain runs locally only and
nothing verifies a push.

**Blocked by:** a hermetic build (above) and a remote.

**Done when:** `.github/workflows/ci.yml` runs the exact chain from
[project-context.md](./project-context.md), in order.

---

## Runtime floor enforcement

**Why:** `package.json` has no `engines` field and no `packageManager` pin, and there is no `.nvmrc`.
A silent major bump is possible; nothing enforces Node 26.x or pnpm 10.

**Blocked by:** nothing.

**Done when:** `engines` and `packageManager` are declared and CI installs from them.

---

## Removing the seed arrays in `src/data/flowboard.ts`

**Why:** `src/components/command-search.tsx:30` imports the hardcoded `projects` array and
`site-header.tsx:73` renders it, so the ⌘K palette lists sample projects rather than the workspace. A
user can click through to a project that does not exist in the database.

**Blocked by:** nothing.

**Done when:** the command palette reads from `useFlowBoard()`, or the seed arrays are deleted.

---

## Wiring or deleting `countOwnedProjects` / `assertMemberExists`

**Why:** both are exported from `src/db/actions/projects.ts` with zero callers across `src/` and
`scripts/` — `removeMemberAction` inlines its own lookup instead. Dead exports.

**Blocked by:** nothing.

**Done when:** each is called, or removed.