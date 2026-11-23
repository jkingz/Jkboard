# Target State — Not Yet Built

Design intent that is **not** implemented. Treat this file as requirements for future work, **never**
as a description of current behavior.

The rule that keeps this file honest: nothing here may be cited as a fact about the running system.
If a line would be a lie if quoted out of context, it belongs in this file, or nowhere.

Decided against, so never listed here: role checks, per-user data and per-row ownership
([ADR 0001](./adr/0001-single-trust-team.md)), and running the integration tier in CI
([ADR 0002](./adr/0002-integration-tier-stays-local.md)).

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

