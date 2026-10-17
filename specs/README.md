# Feature Specs

One file per feature or deliverable unit of work.

## Naming convention

- `01-feature-name.md` — numbered in implementation order
- `00-template.md` — copy this for new specs

## Structure

Each spec describes:
- **Goal** — observable outcome
- **Increments** — implementation phases
- **Open questions** — unresolved decisions
- **Security** — auth/permissions model
- **Verification** — how to prove it works

Specs live here; implementations live in the codebase. When a spec and code disagree, code is truth.

---

## Production-readiness order

Numbered so the order is the argument. "Blocked by" is the only thing that stops a spec, not the only
thing it depends on — 02 assumes 01 exists, and 04 assumes 03 produced something worth running.

| # | Spec | Blocked by |
| --- | --- | --- |
| 01 | [Session identity and action guards](./01-session-identity-and-action-guards.md) | nothing — start here |
| 02 | [Role model and demo scoping](./02-role-model-and-demo-scoping.md) | Q1, Q2, and 01 |
| 03 | [Integration tests that write rows](./03-write-path-integration-tests.md) | permission to write to a disposable database |
| 04 | [Integration tier in CI](./04-integration-tier-in-ci.md) | 03, and a secret decision |
| 05 | [Real chart data or no chart](./05-real-chart-data-or-no-chart.md) | nothing |
| 06 | [Interface test tier](./06-interface-test-tier.md) | permission to install devDependencies |
| 07 | [Settings: persist or delete](./07-settings-persist-or-delete.md) | Q3 |
| 08 | [Email: invite, verification, reset](./08-email-invite-verification-reset.md) | Q2, Q4, a provider and its secret |
| 09 | [Runtime floor, migrations, deployment](./09-runtime-floor-migrations-deployment.md) | the floor: nothing. deployment: a target |

05 and 06 have no dependencies and no owner input, so they are the only work available while the
questions below stay open.

**Why 01 is first.** It started from `auth.api.getSession` being called in exactly one place in the
whole app — `src/app/(dashboard)/layout.tsx:26` — and no export in `src/db/actions/` checking a session
at all. Every later permission spec is decoration until an action knows who is calling.

The first increment has landed: the layout resolves the caller's membership and passes it down, and
`requireMembership()` (`src/db/actions/session.ts`) is awaited first in every mutation. Re-running that
grep over `src/db/actions` now matches exactly one file — the guard itself. What 01 still
owes is in its "Later increments" — per-row ownership, and the two dead exports — and what every
consumer of the guard still owes is proof it executes, which needs spec 03.

**Why 03 precedes 04.** Giving CI a tier that asserts nothing about writes buys a green check and no
proof. The tier has to write a row before running it somewhere shared is worth the secret.

---

## Gating decisions

Four questions in [`docs/product-overview.md`](../docs/product-overview.md) → Open product questions,
restated with the cost of each answer, plus one that the overview records only as an absent deployment
target. **Answering these is the first increment of the whole roadmap** — each one closes or unblocks
more than any code written while it stays open.

- **Q1 — one shared workspace, or per-user scoping?** Multi-tenant means a tenant column, a migration,
  and a rewrite of `getWorkspaceData()` (`src/db/queries/jkboard.ts:91-100`), whose selects have no
  `where` clause at all today. Single workspace means 01 is a day of work and per-row ownership in
  01's "later increments" never arrives.
- **Q2 — should `role` be real authorization?** Decides 02 exists, and whether 08's invite is a
  permission or a courtesy. `member.role` is free text defaulting to `'Member'`
  (`src/db/schema/members.ts:34`) and nothing branches on it.
- **Q3 — which settings pages persist?** All five are fake; the table is in spec 07. Decides 07.
- **Q4 — is email the invite flow?** Decides 08, and unlocks `email_verified`, which is `default(false)`
  (`src/db/schema/auth.ts:18`) with nothing ever setting it — so password reset is impossible today.
- **Deployment target.** None configured (`docs/product-overview.md:35`). Decides the second half of
  09, and makes 01 urgent rather than merely correct.

Record the answers in `docs/product-overview.md` — that file is where a requirement lives — and then
delete the matching line from `docs/target-state.md`, which may not carry a decision as intent.

---

See [docs/project-context.md](../docs/project-context.md) for the commands and gates, and
[docs/architecture.md](../docs/architecture.md) for how the system works today. Design intent that is
not built belongs in [docs/target-state.md](../docs/target-state.md).
