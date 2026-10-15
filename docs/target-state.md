# Target State — Not Yet Built

Design intent that is **not** implemented. Treat this file as requirements for future work, **never**
as a description of current behavior.

The rule that keeps this file honest: nothing here may be cited as a fact about the running system.
If a line would be a lie if quoted out of context, it belongs in this file, or nowhere.

---

## Where each entry is planned

Sequencing, increments and the owner decision that gates each one live in
[`specs/`](../specs/README.md). This file stays intent; a spec is the plan. Do not rename the headings
below — `tests/platform/unit/action-revalidation.unit.test.ts` cites one by name.

| Entry here | Spec |
| --- | --- |
| Scoping the demo account | [02](../specs/02-role-model-and-demo-scoping.md) |
| Per-user workspace scoping | gated on Q1; the guard it needs is [01](../specs/01-session-identity-and-action-guards.md) |
| Authorization on mutations | [01](../specs/01-session-identity-and-action-guards.md), then [02](../specs/02-role-model-and-demo-scoping.md) |
| Behavioural tests for the server actions | [03](../specs/03-write-path-integration-tests.md), CI in [04](../specs/04-integration-tier-in-ci.md) |
| Email on invite | [08](../specs/08-email-invite-verification-reset.md) |
| CI | [04](../specs/04-integration-tier-in-ci.md) |
| Runtime floor enforcement | [09](../specs/09-runtime-floor-migrations-deployment.md) |
| Removing the seed arrays | [05](../specs/05-real-chart-data-or-no-chart.md) |
| Wiring or deleting `countOwnedProjects` / `assertMemberExists` | [01](../specs/01-session-identity-and-action-guards.md) |
| *(no entry — recorded only in product-overview as not built)* | settings pages in [07](../specs/07-settings-persist-or-delete.md), test tier for the interface in [06](../specs/06-interface-test-tier.md) |

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

**Why:** `getMemberId()` (`src/db/queries/jkboard.ts:123`) returns the first `member` row and
`currentMember` is hardcoded to `members[0]` (`src/data/jkboard-store.tsx:325`), so every
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

## Runtime floor enforcement

**Why:** `package.json` has no `engines` field and no `packageManager` pin, and there is no `.nvmrc`.
A silent major bump is possible; nothing enforces Node 26.x or pnpm 10.

**Blocked by:** nothing.

**Done when:** `engines` and `packageManager` are declared and CI installs from them.

---

## Removing the seed arrays in `src/data/jkboard.ts`

**Why:** the store no longer seeds from those arrays — `JkboardProvider` takes `initialData` from
`getWorkspaceData()` (`src/data/jkboard-store.tsx:129-139`, `src/app/(dashboard)/layout.tsx:31`), so
the dashboard lists real rows. What is left is smaller and still false: `overview-charts.tsx:30`
renders `taskCompletionTrend`, twelve hardcoded weeks from `src/data/jkboard.ts:531-543`, labelled as
this workspace's completions; and `src/app/landing/components/product-preview.tsx:33` still imports
the sample arrays. Neither is a store problem. It is a claim problem, in two places.

**Blocked by:** nothing. Spec [05](../specs/05-real-chart-data-or-no-chart.md) notes one prerequisite
it does not spell out here: the chart's real data needs `completedAt`/`createdAt` projected to the
client, and `taskSchema` does not carry them today.

**Done when:** no dashboard surface renders a series that no query produced, and the landing preview is
either computed or labelled a preview. See
[specs/05](../specs/05-real-chart-data-or-no-chart.md).

---

## Wiring or deleting `countOwnedProjects` / `assertMemberExists`

**Why:** both are exported from `src/db/actions/projects.ts` with zero callers across `src/` and
`scripts/` — `removeMemberAction` inlines its own lookup instead. Dead exports.

**Blocked by:** nothing.

**Done when:** each is called, or removed.