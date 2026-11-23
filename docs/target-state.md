# Target State — Not Yet Built

Design intent that is **not** implemented. Treat this file as requirements for future work, **never**
as a description of current behavior.

The rule that keeps this file honest: nothing here may be cited as a fact about the running system.
If a line would be a lie if quoted out of context, it belongs in this file, or nowhere.

Jkboard has no permissions by decision, not by omission: one Workspace, and every Member may do
everything. See [ADR 0001](./adr/0001-single-trust-team.md). Role checks, per-user data and
per-row ownership are therefore not listed here.

---

## Reseeding the demo Workspace

**Why:** the demo credentials are printed on a public landing page, so any visitor can sign in and
empty the shared Workspace. Per [ADR 0001](./adr/0001-single-trust-team.md) the answer is to reseed
it, not to add permissions. Today `db:seed` and `db:seed:auth` only add rows; nothing resets them.

**Blocked by:** nothing. Tracked as #29.

**Done when:** one manual `pnpm` script puts the demo Workspace and its sign-ins back to the seeded
state, and running it twice in a row is safe.

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

## CI and the integration tier — decided, not open

**Decision (2026-11-24, maintainer):** the integration tier stays local-only. CI runs
`pnpm test:unit` and `pnpm test:interface`, never `pnpm test`, and gets no `DATABASE_URL` secret.
A green CI check therefore proves the unit and interface tiers, not the schema; run
`pnpm test:integration` locally before a schema change merges.

This entry is kept only so nobody re-opens the question by accident. It is not work.
