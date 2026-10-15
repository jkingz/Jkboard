# Jkboard

A project and task management dashboard: Next.js 16 (App Router), React 19, Better Auth, Drizzle over
Neon Postgres, and shadcn UI on Base UI.

**Status: pre-production, and deployed nowhere.** Everything below runs against one shared workspace
with one seeded dataset. There is no tenant model, no role enforced on any write, no live customer and
no hosting configured. The way out is specified in [`specs/`](./specs/README.md), numbered by what
unblocks what, and the gaps are listed at the bottom of this file rather than hidden.

## What is real, and what is not

Read this before trusting any feature list, including the one below it.

| Surface | Today |
| --- | --- |
| Sign in / sign up | Real. Better Auth, email and password, credentials in the database. |
| Dashboard, projects, board, task table, calendar | Real. Server-rendered from `getWorkspaceData()`; edits go through server actions and revalidate. |
| Members | Real rows — and every member sees and can delete everything, because no server action checks a role. |
| Roles | Stored, shown and filterable in the team table; **never enforced**. |
| Invitations | The row is written. **No email is ever sent**, so "Resend invite" is a dead affordance. |
| Overview chart | **Fabricated.** A hardcoded 12-week array, not a query. |
| Landing product preview | **Fabricated** by design — it renders sample arrays. |
| Settings | Not wired to the database. `user`, `account`, `notifications` and `connections` have no persistence; `billing` renders committed JSON. |
| Tests over the interface | None. No test has ever rendered a component or written a row. |
| Production hosting | Not configured. |

Kept honest by the files that own these claims:
[`docs/architecture.md`](./docs/architecture.md) and
[`docs/target-state.md`](./docs/target-state.md).

## Features

**Projects and tasks** with a drag-and-drop board · **dashboard** with stats, activity and recent work ·
**calendar** of deadlines · **team** with per-person workload · **email/password auth** via
[Better Auth](https://better-auth.com) · **landing page** in the same app.

A visitor can reach a working dashboard without an account: a demo login is offered on the landing page
and the sign-in form. Its credentials live in `src/lib/demo.ts` and are public by design — a label, not
a secret. The consequence is that every visitor mutates the **same** rows, so never point a real database
at it.

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript — `tsc` from the 7.x native compiler, with the 6.x API installed alongside for eslint |
| Styling | Tailwind CSS v4, shadcn `base-nova` on `@base-ui/react` — **not** Radix |
| Database | PostgreSQL on Neon over `@neondatabase/serverless`, Drizzle ORM |
| Auth | Better Auth with the Drizzle adapter |
| Tables · charts · forms · dnd | TanStack Table · Recharts · React Hook Form + Zod · dnd-kit |

Three conventions in this stack differ from what training data expects (`proxy.ts`, the `cn` package,
Base UI portals). They are listed once, with the reason, in
[`docs/project-context.md`](./docs/project-context.md) → Framework version drift.

## Requirements

`pnpm` is the only package manager: `pnpm-lock.yaml` is the single committed lockfile, and a second
lockfile is a bug rather than a style choice.

**No runtime floor is declared in the repo** — no `engines`, no `packageManager`, no `.nvmrc`. CI
supplies its own pinned Node and pnpm in the job. Declaring the floor is
[`specs/09`](./specs/09-runtime-floor-migrations-deployment.md).

`pnpm-workspace.yaml` is not a workspace. It exists because pnpm 10 refuses dependency postinstall
scripts unless they are allowlisted, and `esbuild` and `unrs-resolver` need theirs to place a native
binary — without it, install fails with `ERR_PNPM_IGNORED_BUILDS`.

## Quick start

```bash
pnpm install
cp .env.example .env.local          # fill in the three values below
pnpm db:migrate                     # or db:push, against a throwaway database
pnpm db:seed && pnpm db:seed:auth   # optional: sample rows and the demo accounts
pnpm dev                            # http://localhost:3000
```

| Variable | What it is |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (Neon console → Connection Details) |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Base URL the app runs on, e.g. `http://localhost:3000` |

Two things that bite on a first run:

- Every `db:*` and seed script runs through `node --env-file=.env.local`, so **`.env.local` must exist
  before any of them starts** — otherwise the failure is a Node usage message, not a config error.
- The build needs these variables **present, not valid**. Placeholders build fine, because
  `(dashboard)` is `force-dynamic` and nothing queries at build time. Deleting `.env.local` is what
  fails it. Names and empty placeholders are all that ever enter git.

The full command list, including the four `db:` verbs and what each one is for, is in
[`docs/project-context.md`](./docs/project-context.md) → Commands.

## Verifying a change

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

That chain is necessary and not sufficient: it proves nothing in a browser, so every unit of work ends
with a live exercise too. The chain, the two test tiers, the reason CI runs only the unit tier, and the
command that proves the build needs no network are all specified once in
[`docs/project-context.md`](./docs/project-context.md) → Verification gates and
[`/verification-gates`](./.claude/skills/verification-gates.md). Report the tier that ran; a skipped
tier is not a pass.

## Where the logic sits

`src/proxy.ts` gates on cookie presence → `(dashboard)/layout.tsx` is the only place a session is
verified → `src/db/queries/jkboard.ts` performs every join → `src/data/jkboard-store.tsx` is the only
client state → `src/db/actions/*.ts` are the only writers. One authority per rule, the table of them and
the deliberate bypass that goes with it:
[`docs/project-context.md`](./docs/project-context.md) → Cross-cutting authority.

## Production readiness — what is missing

Each row is a gap that exists today, and the spec that closes it. Not advice.

| Gap | Spec |
| --- | --- |
| Server actions take `memberId` from the client and trust it; the store falls back to `members[0]` on an empty roster | [`01`](./specs/01-session-identity-and-action-guards.md) |
| No role is enforced; `role` is stored and displayed but never branched on | [`02`](./specs/02-role-model-and-demo-scoping.md) |
| No test has ever written a row | [`03`](./specs/03-write-path-integration-tests.md) |
| The integration tier runs in no CI job, and that job has no Postgres service | [`04`](./specs/04-integration-tier-in-ci.md) |
| The overview chart is a hardcoded array | [`05`](./specs/05-real-chart-data-or-no-chart.md) |
| Nothing tests rendered UI | [`06`](./specs/06-interface-test-tier.md) |
| Settings routes that never call a server action | [`07`](./specs/07-settings-persist-or-delete.md) |
| No email transport, so invites are never sent | [`08`](./specs/08-email-invite-verification-reset.md) |
| No declared runtime floor, no rule for which migration verb production uses, no deployment target | [`09`](./specs/09-runtime-floor-migrations-deployment.md) |

The open product questions that gate that list are recorded in
[`docs/product-overview.md`](./docs/product-overview.md) → Open product questions and numbered Q1–Q4 in
[`specs/README.md`](./specs/README.md) → Gating decisions. The one that changes the shape of the work:
**single shared workspace, or multi-tenant?**

## Where the knowledge lives

| | |
| --- | --- |
| [`AGENTS.md`](./AGENTS.md) | the rules every change obeys |
| [`docs/`](./docs/README.md) | commands, schema, routes, conventions — one file per concern |
| [`specs/`](./specs/README.md) | one numbered file per unit of work, ordered by dependency |
| [`tests/README.md`](./tests/README.md) | the test tree and the traps it has already hit |
| [`.claude/skills/`](./.claude/skills/) | the workflows agents load: development loop, gates, testing, git, PRs |

Contributing: Conventional Commits, subject says *why*, body ≤ 4 lines; PR titles are
`type(scope): imperative summary`; one PR per unit; **draft until CI is green**. Every unit closes with
the two-line Done / Next block in [`/development-workflow`](./.claude/skills/development-workflow.md)
step 6.

## Provenance and license

Built on top of the open-source [shadcn Dashboard + Landing Page Template](https://github.com/shadcnstore/shadcn-dashboard-landing-template)
by [ShadcnStore](https://shadcnstore.com), extended with authentication, a Postgres data layer and
Jkboard's project and task features.

That template is MIT-licensed. **This repo declares no license**: `package.json` is `private: true` with
no `license` field, and there is no `LICENSE` file. That is a decision for the owner, not an agent — so
do not assume this may be redistributed.
