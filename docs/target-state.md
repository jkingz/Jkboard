# Target State — Not Yet Built

Design intent that is **not** implemented. Treat this file as requirements for future work, **never**
as a description of current behavior.

The rule that keeps this file honest: nothing here may be cited as a fact about the running system.
If a line would be a lie if quoted out of context, it belongs in this file, or nowhere.

---

## Scoping the demo account

**Why:** the demo credentials are printed on a public landing page, and **no server action checks a
role**. Any visitor can read the page, sign in, and delete every project in the shared workspace.
Right now the demo is safe only because nobody is actively destroying it.

**Blocked by:** the authorization work below.

**Done when:** a session belonging to a demo account cannot delete or invite. Either enforce a role
in each server action, or give the demo a scoped session that cannot write.

---

## Per-user workspace scoping

**Why:** identity is now resolved from the session (`currentMember`), but nothing is scoped
by it: `getWorkspaceData()` (`src/db/queries/jkboard.ts:90`) selects `project`, `task` and `member` with
no `where` clause at all, so every member sees and writes the same rows. Real scoping needs the caller's
membership threaded into every query.

**Blocked by:** an owner decision on whether one shared workspace is the intended product — see
[product-overview.md](./product-overview.md) → Open product questions.

**Done when:** two signed-in users see different data, proven by a test that fails today.

---

## Authorization on mutations

**Why:** every action now checks *who* is calling — `requireMembership()`
(`src/db/actions/session.ts`) is awaited first — and nothing checks *whether they may*. `member.role` is
a free-text column nothing branches on, and each action still takes a raw id and acts on it, so any
signed-in member can delete any project by id. Anonymous callers are no longer among them.

**Blocked by:** the same owner decision as scoping, plus a role model (`role` is currently free text
with default `"Member"`).

**Done when:** each action verifies the caller and their permission against `member`, with the
unauthorized case covered by a test.

---

## Behavioural tests for the server actions

**Why:** the integration tier is currently **read-only** — it asserts the schema in
`information_schema` and never inserts. It therefore proves the schema shape, not that
`createTaskAction` writes correctly, that `revalidatePath` runs, or that a bad payload is rejected.

`tests/platform/unit/action-revalidation.unit.test.ts` closes the middle one only as far as text can:
it proves the call is still written at every mutation, not that it executed or that the client picked
up the result. This entry stays open until something inserts a row.

**Blocked by:** nothing. It needs a disposable database, since it writes rows. Point it at a scratch
Neon branch rather than the working one.

**Done when:** the integration tier inserts and reads back a task, and covers a rejected payload.

---

## Email on invite

**Why:** `inviteMemberAction` writes the `user` + `member` rows and stops. Nothing is sent, so the
invitee must already know to sign in.

**Blocked by:** an owner decision on whether email is the intended flow — see
[product-overview.md](./product-overview.md).

**Done when:** an invited address receives a usable sign-in link.

---

## CI

**Why:** `.github/workflows/ci.yml` exists and runs `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`
and `pnpm build` on push and pull request — but it runs the **unit tier only**. The integration tier
is the credential-free half that proves the persistence invariants, and it runs nowhere but one
machine. A green check therefore does not mean the schema was verified.

**Blocked by:** nothing. It needs an owner decision on whether the integration tier gets a
`DATABASE_URL` in CI (a Neon branch URL stored as a repository secret) or stays local-only.

**Done when:** CI runs `pnpm test` unmodified, or the decision to keep it local is written down
here as final rather than open.

---

## Replacing seeded Overview metrics

**Completed:** The workspace loads live rows. The Overview uses live task counts, deadlines,
and project completion. The landing previews still use sample rows and label them as example data.

---

## Wiring or deleting `countOwnedProjects` / `assertMemberExists`

**Why:** both are exported from `src/db/actions/projects.ts` with zero callers across `src/` and
`scripts/` — `removeMemberAction` inlines its own lookup instead. Dead exports.

**Blocked by:** nothing.

**Done when:** each is called, or removed.