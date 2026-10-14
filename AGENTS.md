<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# AGENT-READY PROJECT INSTRUCTION LAYER

This file is the complete guidance system for FlowBoard. **Read STANDING RULES before every task.** Then read APPLICATION BUILDING CONTEXT in order when making architectural decisions. SERVICE ARCHITECTURE describes what is built; TARGET STATE describes what is not.

**Health check (fills slots, zero hits means done):**
```bash
grep -n '<[a-zA-Z_/]' AGENTS.md | grep -v 'VERIFICATION STANDARDS\|FEATURE SPECS/00-template'
```

---

# STANDING RULES — Read first, before any task

Constraints that apply to every change. Read these **in full** before every taskable request. Skip nothing.

## Portable core — Rules 1–10

These rules hold in every repo.

### 1. Be very concise
- Keep responses short. Sacrifice grammar for concision.
- No preamble, no "here is what I did" essays. State the change + the result + the one thing you need from me.

### 2. No "done" without a command behind it
- Every claim of completion names the command run and what it printed.
- Untested by you = unverified. Say "not verified" instead of "should work".
- Type-checking proves types, not behavior. CI passing proves the push, not the feature.

### 3. Scope is the request, not the opportunity
- The blast radius of a change equals the radius of what was asked. Fix the reported defect only.
- No drive-by cleanup, renames, formatting, "while I'm here" extractions, or predicted abstractions.
- Nearby problems you spotted: one line in the reply only. Not in the diff.

### 4. Delete unused, but prove it was unused
- Remove dead files, exports, imports, env vars, CSS, tokens and orphaned components.
- Grep for callers before deleting; state what you removed and how you checked.

### 5. Servers, ports, processes
- Restart or kill running servers only during the current task.
- Clear stale processes on ports the app uses before starting your own.
- End a session with no orphaned dev server, queue worker, or background job.

### 6. Secrets
- Never print a secret value — reference it by name. Redact anything in output.
- `.env*` stays out of git. Only names and empty placeholders go into committed files.
- Privileged keys stay server-side: if a value is visible in a client bundle or public response, it is not a secret.

### 7. Git discipline
- Commit, push, open or merge a PR **only when asked**.
- Before pushing to a working branch: pull from main, merge, resolve conflicts, then commit/push.
- No `--no-verify`, no skipped hooks, no bypassed signing.
- Never force-push a shared branch, and never `git reset --hard` / `clean -f` / `checkout --` over work you did not write.
- Destructive or externally visible actions need explicit authorization every time.

### 8. Pull-request babysitting
- Applies only once a remote exists. FlowBoard has **no remote configured** (`.git/config` has no `[remote "origin"]`), so nothing here is exercisable yet.
- When a remote is added, follow the `babysitting-a-pr` skill when watching a PR.
- Every comment posted follows `leaving-pr-comment`: triggers, body contract, mandatory first-line AI-authorship disclaimer.

### 9. Skills and instructions come before improvising
- Check available skills before starting a task; if one applies, use it rather than re-deriving the workflow.
- A harness capability that exists is used — do not hand-write a loop the platform already provides.

### 10. Unknowns are labelled, not invented
- No fabricated thresholds, policies, precedents, APIs or file paths.
- State assumptions plus the step that would verify them.
- When implementation and docs disagree, code is truth and the doc is a defect.

## Project-specific rules

### 11. Package manager and runtime
`pnpm` only. `pnpm-lock.yaml` is the single lockfile (lockfileVersion `9.0`) and the only one committed — do not generate `package-lock.json` or `yarn.lock`.
**No runtime floor is declared.** `package.json` has no `engines` field and no `packageManager` pin; there is no `.nvmrc`. Verified on Node v26.8.2 / pnpm 10.18.3. Adding `engines` + `packageManager` is a deliberate open item, not an oversight to paper over silently.

### 12. Framework version drift
Next.js **16.4.0** (`package.json`). This major renamed middleware and moved shadcn onto Base UI — both break training-data assumptions. Read the installed guide at `node_modules/next/dist/docs/` before touching framework APIs; details in ARCHITECTURE CONTEXT → Framework rules.

### 13. Verification gates
The chain, in this exact order, is the definition of done:

1. `pnpm typecheck` (`tsc --noEmit`)
2. `pnpm lint` (`eslint .`)
3. `pnpm build` (`next build`)

**There is no test gate, because there is no test runner.** `package.json` has no vitest/jest/playwright dependency and the repo has no `tests/` directory. This is a known, accepted gap — not a pass. A green run of these three gates proves types, lint and build only; it says nothing about behavior. Adding a runner is the first thing that would close this slot. See `/verification-gates` skill.

### 14. Application building order
Read these sections in order: `STANDING RULES` → `PROJECT OVERVIEW` → `ARCHITECTURE CONTEXT` → `UI CONTEXT` → `CODE STANDARDS` → `DEVELOPMENT WORKFLOW` → `PM CONVENTIONS`. Then `SERVICE ARCHITECTURE` section.

### 15. Cross-cutting authority
Four rules, one authority each. No module may re-implement them in its own language.

| Rule | Single authority | Notes |
|---|---|---|
| Session verification | `src/app/(dashboard)/layout.tsx:25` — `auth.api.getSession()` | **The only call site in `src/`.** Verified by grep. |
| Cookie presence (optimistic) | `src/proxy.ts:14` — `export function proxy()` | Cookie *existence* only. Cannot reach the DB; the proxy bundle has no database import. |
| Workspace read model | `src/db/queries/flowboard.ts` — `getWorkspaceData()` | All joins happen here so the UI stays on flat arrays. |
| Mutation entrypoint | `src/db/actions/*.ts` — Zod-parse, write, `revalidatePath("/", "layout")` | One action per operation; nothing writes outside these files. |

Identity lives in Better Auth's `user` table; workspace membership lives in `member`. Neither is duplicated.

### 16. Datastore / external service
PostgreSQL on Neon, reached over HTTP by `@neondatabase/serverless` (`neon-http` driver), so it works in serverless/edge runtimes. Schema is Drizzle, `casing: "snake_case"` declared in **both** `drizzle.config.ts` and `src/db/index.ts` — changing one without the other silently desyncs property names from column names.

Migrations are versioned files in `drizzle/` (`0000_fixed_jetstream.sql`, `0001_add_task_reference.sql` + `drizzle/meta/`). **Never edit an applied migration** — append a new one via `pnpm db:generate`. `pnpm db:push` is the shortcut for local iteration and skips the migration files entirely; do not rely on it for schema you intend to keep.

Env vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (see `.env.example`). All three must be **present** for `pnpm build` and `pnpm dev`; the `db:*` and seed scripts additionally load them via `node --env-file=.env.local`.

The build **does not require them to be valid.** Verified: `pnpm build` exits 0 against the literal placeholder `postgresql://USER:PASSWORD@HOST/neondb` from `.env.example`, because `(dashboard)` is `force-dynamic` so nothing queries at build time. Deleting `.env.local` fails the build instead, with `Failed to collect page data for /projects` → `DATABASE_URL is not set` — the page-data step imports `db`, which throws on a missing value. So: placeholders build, absence does not. CI can therefore build without secrets, but must still supply non-empty values.

### 17. Protected foundations
These must not be edited to make a feature pass. Changing one is a bigger decision than the feature that asked for it:

- `drizzle/0000_*.sql`, `drizzle/0001_*.sql` — applied migrations
- `src/db/schema/auth.ts` — mirrors Better Auth's own generated PostgreSQL schema; hand-edits desync from the adapter
- The `nextjs-agent-rules` block at the top of this file — regenerated by `next dev`
- `src/proxy.ts`'s "must not redirect signed-in users away from `/sign-in`" comment — the reason is a redirect loop, and it is subtle

---

# APPLICATION BUILDING CONTEXT

Read these sections in the order above (rule 14). Update the section your change invalidates before continuing.

## Project Overview

### Status

**Built** — email/password sign-up and sign-in; one shared workspace loaded server-side; projects with CRUD, status and membership; tasks with CRUD, status, priority, assignee, due date, duplicate and drag-and-drop ordering; kanban board per project; filterable/sortable task table; deadline calendar; team page with invite/status/remove; dashboard with stats, charts, recent projects and tasks; marketing landing page; light/dark theming with a runtime theme customizer.

**Not built** — verified by reading the code, not assumed:
- **Multi-tenancy / per-user scoping.** There is exactly one workspace. `getMemberId()` (`src/db/queries/flowboard.ts:123`) returns the *first* `member` row ordered by nothing in particular, and `currentMember` is hardcoded to `members[0]` (`src/data/flowboard-store.tsx:308`). Every signed-in user sees and can mutate the same data.
- **Authorization.** No role check guards any mutation. `role` is a free-text column with default `"Member"`; nothing branches on it. Any authenticated session can delete any project.
- **Email delivery.** `inviteMemberAction` creates the `user` + `member` rows and stops. No message is sent; the invitee must already know to sign in.
- **Tests.** No runner, no files.
- **Settings are static.** `settings/billing` reads from `data/*.json` files committed to the repo. `settings/user`, `settings/account`, `settings/notifications`, `settings/connections` have no persistence.
- **Deployment.** No remote, no CI.

Verified: 2026-10-15, against commit `24d186c`.

### Overview

FlowBoard is a project and task management dashboard for a single team: create projects, break them into tasks, and track who is assigned what and when it is due. It grew out of a shadcn dashboard/landing template; the template supplied the shell (sidebar, theming, landing page, settings pages) and FlowBoard supplied the auth, Postgres data layer, and the actual project/task domain.

### Core user flow
1. `/` → client-side `router.replace("/landing")` → `/sign-up` → `(dashboard)/layout.tsx` verifies session → `/dashboard`.

### Scope

**In scope:** single-workspace project/task tracking; the dashboard shell and landing page inherited from the template.

**Out of scope:**
- Multi-tenancy and row-level authorization — the schema has no tenant column and adding one is a migration plus a rewrite of every query, not a feature.
- Billing — the billing page is static template JSON; wiring a provider is undecided.

### Success criteria
None recorded. No owner has stated a target, and none is invented here.

### Open product questions
- Should `role` become real authorization, or is FlowBoard intentionally single-trust-team?
- Should invites send email, or is "sign in with the address you were invited with" the intended flow?
- Which settings pages are meant to persist, and which are permanent template decoration?

---

## Architecture Context

### Stack

| Layer | Choice | Verified against |
| --- | --- | --- |
| Framework | Next.js 16.4.0, App Router | `package.json` |
| UI runtime | React 19.3.0 | `package.json` |
| Language | TypeScript 6.0.3, `strict: true` | `package.json`, `tsconfig.json` |
| Datastore | PostgreSQL (Neon) via `@neondatabase/serverless` 1.2.0 | `src/db/index.ts` |
| ORM | Drizzle ORM 0.45.4 / drizzle-kit 0.31.11 | `drizzle.config.ts` |
| Auth | Better Auth 1.7.7, Drizzle adapter | `src/lib/auth.ts` |
| Styling | Tailwind CSS v4 (`@theme inline`), shadcn `base-nova` on **Base UI** | `globals.css`, `components.json` |
| Components | `@base-ui/react` 1.8.0 — **not** Radix | `package.json` |
| Tables / charts / DnD | TanStack Table 9, Recharts 3.8, dnd-kit 6.3 | `package.json` |
| Class merging | `cn` package 0.4.0 | `src/lib/utils.ts` |

### System boundaries

```
/ (client redirect) → /landing
                          └─ /sign-in, /sign-up → Better Auth forms
                                                       │
proxy.ts (cookie presence only, nodejs runtime) ───────┤
                                                       ▼
(dashboard)/layout.tsx ── auth.api.getSession() ──► redirect("/sign-in") if null
        │
        └── getWorkspaceData() ──► drizzle/neon-http ──► Postgres
                 │
                 └── initialData prop ──► DashboardShell ──► FlowBoardProvider (client ctx)
                                                        │
        ┌───────────────────────────────────────────────┘
        ▼  every page calls useFlowBoard()
   actions.* ──► db/actions/*.ts ──► db ──► revalidatePath("/", "layout")
```

The database is imported **only** from `src/db/**` and `src/lib/auth.ts`. No client component may import `db` — `src/db/index.ts` is marked `server-only`, which is the enforcement.

### Storage model

- Records are **mutated in place**, not append-only. The one append-ish behaviour is `task.reference`, generated by a database sequence.
- `task.reference` defaults to `'TSK-' || lpad(nextval('task_reference_seq')::text, 4, '0')` and is `UNIQUE`. It exists purely so the UI never displays a 36-char UUID. **The database generates it; the client never supplies it.**
- No JSONB columns. Every queryable field is a typed column, so reads are plain selects — there is no "the values live in a JSON blob" trap here.
- Dates: `start_date`/`due_date` are `date` with `mode: "string"` (no timezone). Timestamps are `withTimezone: true`. The query layer converts to `YYYY-MM-DD` via UTC (`toISODate`, `src/db/queries/flowboard.ts:32`).
- `task.position` is an integer, **descending** — new tasks get `min(...) - 1` so they land at the top of a column.

### Persistence schema

DDL from `src/db/schema/*.ts`. Columns people commonly assume exist but do not:

- **`member` has no `name`, `email`, or `image` column.** Identity lives in `user`; `member` holds only membership. Reading `member.email` is a runtime failure, not a type error that fires early.
- **`task.description` is a column with no reader.** It is written by `createTaskAction`/`updateTaskAction` and selected nowhere: `taskSchema` (`src/data/flowboard.ts:60`) has no `description` field, so it never enters the view model and is never rendered. `project.description` **is** read and rendered (`projects-grid.tsx:275`, `project-board.tsx:127`). Do not generalise one to the other.
- **`task.completedAt` is set by application logic, not the database.** `updateTaskAction` (`src/db/actions/tasks.ts:113`) writes it when status is `completed`, nulls it when `todo`, and writes a literal `sql\`null\`` for `in-progress`/`in-review` — deliberately preserving a prior completion timestamp for tasks moved back from `completed`.

Tables:

- **`user`**: `id` text PK, `name`, `email` unique, `email_verified` bool, `image`, `created_at`, `updated_at`. Better Auth owns this table.
- **`session`**: `id` text PK, `expires_at`, `token` unique, `user_id` → `user.id` cascade, `ip_address`, `user_agent`, timestamps. Indexed on `user_id`.
- **`account`**: `id` text PK, `account_id`, `provider_id`, `user_id` → cascade, `password`, token columns, `scope`, timestamps. Indexed on `user_id`. Email/password only — no OAuth provider is configured.
- **`verification`**: `id` text PK, `identifier`, `value`, `expires_at`, `created_at`. Indexed on `identifier`.
- **`member`**: `id` uuid PK, `user_id` → `user.id` cascade, `role` text default `'Member'`, `status` enum (`active`|`invited`|`away`) default `invited`, `joined_at`, `last_active_at`. Unique on `user_id`. **No email/name columns.**
- **`project`**: `id` uuid PK, `name`, `key` unique (2–4 letters, stored uppercased), `description` default `''`, `status` enum (`planning`|`active`|`on-hold`|`completed`) default `planning`, `color` default `'var(--chart-1)'`, `owner_id` → `member.id` **`on delete restrict`**, `start_date`, `due_date`, timestamps. Indexed: status, owner_id, due_date.
- **`project_member`**: composite PK `(project_id, member_id)`, both cascade. The join table; no surrogate key, no timestamps.
- **`task`**: `id` uuid PK, `reference` text unique (sequence default), `project_id` → cascade, `title`, `description` default `''`, `status` enum default `todo`, `priority` enum (`urgent`|`high`|`medium`|`low`) default `medium`, `assignee_id` → `member.id` **`on delete set null`**, `due_date`, `position` int default 0, `completed_at`, timestamps. Indexed: project_id, status, due_date, assignee_id, (project_id, status).

The two delete behaviours are load-bearing and asymmetric:
- `project.owner_id` is **RESTRICT** — a member who still owns a project cannot be deleted.
- `task.assignee_id` is **SET NULL** — a departing member leaves their tasks in place, unassigned.

`removeMemberAction` (`src/db/actions/members.ts:139`) therefore transfers owned projects to another member *before* deleting the `user` row, and throws if there is nobody left to transfer to. Note it deletes from **`user`**, not `member` — the membership and join rows go by cascade.

### Auth & tenancy model

- **Identity**: Better Auth session cookie → `auth.api.getSession()`. Where role/ownership lives: the `member.role` **column**, read by nobody.
- **The single authority** for "may this caller see this data": `src/app/(dashboard)/layout.tsx:25`. If it returns a session, the caller sees the entire workspace. There is no second check anywhere.
- **Deliberately unguarded**: server actions under `src/db/actions/` carry **no session check at all**. They are reachable by any authenticated caller for any record ID. They are protected from anonymous callers only by the `(dashboard)` layout and the proxy — i.e. by the route tree, not by the action itself. If an action is ever called from somewhere outside `(dashboard)`, it is fully open.
- `src/proxy.ts` is an **optimistic** check only. It calls `getSessionCookie(request)` — presence, not validity — because the proxy bundle cannot import the database. A stale cookie passes it and is caught by the layout. It must never redirect signed-in users away from `/sign-in`; that produces an infinite `/sign-in → /dashboard → /sign-in` loop.

### HTTP surface — implemented

| Route | Method | Auth | Params / headers | Notes |
| --- | --- | --- | --- | --- |
| `/api/auth/[...all]` | GET, POST | Better Auth | `session` cookie | `toNextJsHandler(auth.handler)` — every Better Auth endpoint. The only API route in the app. |
| `/dashboard` `/projects` `/projects/[id]` `/tasks` `/calendar` `/users` `/settings/*` | GET | proxy cookie check + layout `getSession` | — | `export const dynamic = "force-dynamic"`; no cache tags anywhere. |

All mutations are **server actions**, not HTTP endpoints — see the Modules table.

### HTTP surface — planned, not built
None. There is no REST/JSON surface for projects or tasks.

### Background work
None. No queue, worker, or cron. `scripts/` contains only `seed.ts`, `seed-data.ts`, `seed-auth.ts`, all invoked manually.

### Invariants

1. **The database is never imported from a client component.** Enforced by `server-only` in `src/db/index.ts` and `src/lib/auth.ts`, plus `"use server"` in `src/db/actions/*.ts`. Violating it ships credentials to the browser.
2. **`member` has no identity columns.** Name and email are read by joining `user`. A query selecting `member.name` fails at runtime.
3. **`task.reference` is database-generated and client-supplied values are ignored.** A caller cannot choose a reference.
4. **Every mutation ends in `revalidatePath("/", "layout")`.** Omitting it leaves the client context showing stale data after a successful write, with no error to trace.
5. **`proxy.ts` never redirects a session-bearing request away from `/sign-in`/`/sign-up`.** Violating it produces an infinite redirect loop that flickers between the loading state and the form.
6. **Project ownership transfers before member deletion.** `owner_id` is `ON DELETE RESTRICT`; skipping the transfer makes `removeMemberAction` throw at the database.

**None of these have a test.** There is no test runner. Every invariant above is currently a hope, and they are the exact cases a first test suite should cover.

---

## UI Context

### Design tokens

Tailwind v4, `@theme inline` in `src/app/globals.css` maps `--color-*` to the shadcn variables. Reference these in JSX (all verified present):

- Surfaces: `bg-background` `bg-card` `bg-popover` `bg-sidebar`
- Text: `text-foreground` `text-muted-foreground` `text-card-foreground` `text-sidebar-foreground`
- Intent: `bg-primary` `bg-secondary` `bg-muted` `bg-accent` `bg-destructive` and each `-foreground` pair
- **Project-specific, not part of the shadcn base palette:** `bg-success` `bg-warning` `bg-info` + foregrounds
- Lines: `border-border` `border-input` `ring-ring`
- Charts: `chart-1` … `chart-5` — stored as the literal string `var(--chart-1)` in `project.color`
- Radius: `--radius: 0.625rem`, with `sm`/`md`/`lg`/`xl` derived
- Font: `--font-sans` → `var(--font-inter)`

Dark mode is a `.dark` class via `@custom-variant dark (&:is(.dark *))` and `next-themes`, plus a custom View Transitions circular theme customizer.

### Per-component conventions
- UI primitives in `src/components/ui/` follow shadcn `base-nova` on **Base UI**, not Radix. Their APIs are Base UI's — do not port Radix prop names from memory.
- Aliases (`components.json`): `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, `@/hooks`. `@/` maps to `./src/*`.
- Feature components live beside their route in a `components/` subfolder.
- Icons: `lucide-react`, tree-shaken via `optimizePackageImports` in `next.config.ts`.

### Styling rules
- Everything colour-related is a token. No raw hex, no `oklch()` in JSX.
- Radius utilities only — no arbitrary pixel values.
- `cn()` from `@/lib/utils` for every conditional class list.

### Images / assets
- `next/image` for raster content; remote hosts allowed are `ui.shadcn.com` and `images.unsplash.com` only (`next.config.ts`).
- **Inter is fetched from Google at build time** via `next/font/google` (`src/lib/fonts.ts`), so the build is **not hermetic**. Proven both ways: with a warm `.next` a blackholed-egress build exits 0 and looks fine; after `rm -rf .next` the same command exits 1 with `Error while requesting resource … fonts.googleapis.com/css2?family=Inter`. Always test cold:
  ```bash
  rm -rf .next && NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:9 pnpm build
  ```
  A sealed CI runner has no egress, so it will fail unless the font is vendored or the build tolerates the fallback. This is a known open item, not a solved problem.
- Security headers are set globally in `next.config.ts`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: origin-when-cross-origin`.

---

## Code Standards

### General
- Imports use the `@/` alias, never relative paths across directories.
- `"use client"` only where interactivity requires it. Data access stays server-side; the client reads from `useFlowBoard()`.
- Comments explain **why**, not what. The existing codebase does this well — match it. A comment restating the code below it is noise.

### Language strictness
`tsconfig.json`: `strict: true`, `noEmit: true`, `isolatedModules: true`, `moduleResolution: "bundler"`, target ES2022, `paths` for `@/*`. Notably **not** enabled: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. The mutations lean on explicit `...(x !== undefined && { x })` spreads rather than optional-property types.

### Framework rules
Next.js 16 differences that training data gets wrong — each confirmed against `/vercel/next.js/v16.2.9`:

- **`middleware.ts` → `proxy.ts`.** The file is named `proxy.ts` and exports `proxy`, not `middleware`. A proxy file must export exactly one function; multiple proxy functions in one file are unsupported. The `edge` runtime is **not** supported in `proxy` — it is `nodejs` and not configurable. `src/proxy.ts` already complies; do not "fix" it back to middleware.
- Codemod if you ever need it: `npx @next/codemod@canary middleware-to-proxy .`

Other pins that bite:
- shadcn is on **Base UI** (`@base-ui/react`), not Radix. Portal/overlay/ref-prop idioms differ.
- `cn()` comes from the standalone `cn` package. **`clsx` and `tailwind-merge` are not installed** — importing them fails.
- `next dev` regenerates the `nextjs-agent-rules` block at the top of this file.

### Error handling
- Server actions validate with Zod and throw `Error` with a user-readable message (e.g. `"Someone with that email is already in the workspace."`).
- **The client is the sanitising layer.** `src/data/flowboard-store.tsx` catches and re-wraps via `errorMessage(error, fallback)`, then rethrows a message safe to display. Internal stack traces never reach the UI — but that is by convention in one file, not by framework enforcement.
- A thrown `Error` in an action surfaces as a rejected promise on the client, which the store converts to `throw new Error(...)`. The UI is expected to catch it.

### HTTP handlers
There is exactly one, `src/app/api/auth/[...all]/route.ts`:

```ts
import { toNextJsHandler } from "better-auth/next-js"
import { auth } from "@/lib/auth"

export const { GET, POST } = toNextJsHandler(auth.handler)
```

All status and validation logic lives inside Better Auth. FlowBoard does not hand-roll an auth endpoint, and must not.

### Data access
- Reads: `src/db/queries/flowboard.ts` only. It flattens joins into arrays so the UI never assembles relationships itself.
- Writes: `src/db/actions/{projects,tasks,members}.ts` only.
- Both use the same `db` handle from `src/db/index.ts`. No other module touches Drizzle.

### File organization

```
src/
├── app/
│   ├── (auth)/          sign-in, sign-up, and error pages (401/403/404/500/maintenance)
│   ├── (dashboard)/     the app shell; layout.tsx is the auth + data authority
│   │   ├── dashboard/   stats, charts, recent projects/tasks
│   │   ├── projects/    grid + [id] kanban board
│   │   ├── tasks/       TanStack table, add-task modal, row actions
│   │   ├── calendar/    deadline calendar
│   │   ├── users/       team table, invite dialog
│   │   └── settings/    user, account, notifications, connections, billing (mostly static)
│   ├── api/auth/        Better Auth handler
│   └── landing/         marketing page
├── components/
│   ├── ui/              shadcn Base UI primitives
│   ├── theme-customizer/
│   └── *.tsx            app-shell pieces (sidebar, header, dialogs)
├── contexts/            sidebar + theme React contexts
├── data/                flowboard.ts (types + pure selectors), flowboard-store.tsx (client ctx)
├── db/
│   ├── schema/          Drizzle tables
│   ├── actions/         server actions (writes)
│   └── queries/         read model
├── hooks/               use-mobile, use-theme, use-email-password, sidebar/theme
├── lib/                 auth.ts, auth-client.ts, utils.ts, fonts.ts, data-table.ts
└── types/  config/  utils/
```

Protected: `src/db/schema/auth.ts`, the two files in `drizzle/`, the `nextjs-agent-rules` block above.

### Testing
No runner, no `tests/` directory, no test script in `package.json`. Structure convention if one is added: `tests/{feature}/{tier}/` with tiers `unit`/`integration`/`e2e`, importing via `@/`, never relatively. See `/testing` skill.

---

## Development Workflow — Project appendix

### Commands

| Need | Command |
|------|---------|
| Dev server | `pnpm dev` |
| Tests | **none — no runner installed** |
| Types | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Build | `pnpm build` |
| Migrations | `pnpm db:generate` (new) · `pnpm db:migrate` (apply) · `pnpm db:push` (local shortcut, skips files) |
| Studio | `pnpm db:studio` |
| Seed | `pnpm db:seed` (data) · `pnpm db:seed:auth` (auth users) |

All `db:*` and seed scripts run through `node --env-file=.env.local`, so `.env.local` must exist first.

`pnpm` only; Node v26.8.2 / pnpm 10.18.3 verified locally, but nothing enforces a floor (see §11).

### Where logic goes
- `src/db/queries/` — reads
- `src/db/actions/` — writes, one file per entity
- `src/data/flowboard.ts` — types and pure selectors (`getTaskStats`, `getProjectProgress`, `getWorkload`); no I/O
- `src/data/flowboard-store.tsx` — the only client-side state; owns optimistic updates and error sanitising
- `src/app/(dashboard)/**/components/` — route components

Protected: as in §17.

### Schema changes
`pnpm db:generate` → review the SQL in `drizzle/` → `pnpm db:migrate`. Editing an already-applied migration is never allowed. Keep `casing: "snake_case"` in sync between `drizzle.config.ts` and `src/db/index.ts`.

### Data today
`pnpm db:seed`. Every screen reads rows written by the seed scripts — there is no other data source, and no way to create a second workspace.

### Before moving to the next unit

1. The unit works end to end inside the scope stated at the start.
2. No invariant in ARCHITECTURE CONTEXT was violated.
3. The gate chain (typecheck → lint → build) is green.
4. Any section of this file the change made untrue has been updated **in the same change**.

---

## PM Conventions

### Commits
- Prefix: `feat:` `fix:` `style:` `perf:` `refactor:` `chore:` `docs:` `test:` `build:` `ci:`
- One logical change per commit. Subject says **why**, body ≤ 4 lines.
- Never commit secrets or real env values.

### PRs
No remote is configured, so PRs are not currently possible. When one is: title in the form `feat(auth): add sign-out` — type, scope in parens, colon, imperative summary — body covering what changed / how verified / what wasn't covered, one PR per unit, draft until green.

### Review gate
`pnpm typecheck` → `pnpm lint` → `pnpm build`, in that order. See §13.

---

# SERVICE ARCHITECTURE — Implemented surface

This section describes only code that exists. Design intent for what is **not** built lives in TARGET STATE below; never cite that section as current behavior.

## Request path
```
route → proxy.ts (cookie presence) → (dashboard)/layout.tsx (getSession + getWorkspaceData)
      → page component → useFlowBoard() → actions.* → db/actions/*.ts → Postgres
```

## Modules

| Module | Status |
| --- | --- |
| `src/proxy.ts` | implemented: `proxy()`, `config.matcher`. Cookie-presence redirect. |
| `src/lib/auth.ts` | implemented: `auth` (Better Auth), `Session`/`SessionUser` types. `databaseHooks.user.create.after` auto-creates a `member` row with status `invited`. |
| `src/lib/auth-client.ts` | implemented: client auth instance |
| `src/db/index.ts` | implemented: `db`, `schema`, `Database`. `server-only`, dev hot-reload reuse via `globalThis`. |
| `src/db/schema/*` | implemented: `user`, `session`, `account`, `verification`, `member`, `projectMember`, `project`, `task` |
| `src/db/queries/flowboard.ts` | implemented: `getWorkspaceData()`, `getMemberId()`, `WorkspaceData` |
| `src/db/actions/projects.ts` | implemented: `createProjectAction`, `updateProjectAction`, `setProjectStatusAction`, `deleteProjectAction`, `countOwnedProjects`, `assertMemberExists` |
| `src/db/actions/tasks.ts` | implemented: `createTaskAction`, `updateTaskAction`, `setTaskStatusAction`, `duplicateTaskAction`, `deleteTaskAction` |
| `src/db/actions/members.ts` | implemented: `inviteMemberAction`, `setMemberStatusAction`, `removeMemberAction` |
| `src/data/flowboard.ts` | implemented: `Project`/`Task`/`Member` types, `getTaskStats`, `getProjectProgress`, `getWorkload` |
| `src/data/flowboard-store.tsx` | implemented: `FlowBoardProvider`, `useFlowBoard` |
| `src/app/api/auth/[...all]/route.ts` | implemented: `GET`, `POST` |
| `src/app/(dashboard)/layout.tsx` | implemented: `DashboardLayout` — session gate + data load |

**Zero-caller note:** `countOwnedProjects()` and `assertMemberExists()` in `src/db/actions/projects.ts` are exported but have **no callers** — `removeMemberAction` inlines its own lookup instead. Verified by grep across `src/` and `scripts/`. They are dead exports; remove them or wire them in.

**Stale hardcoded data:** `src/data/flowboard.ts` also exports module-level seed arrays `members`, `projects` and `tasks` (lines 183, 266, 396) plus a `taskSeeds` input. These are **not** the live workspace. Dashboard pages get data from `useFlowBoard()`, and the selectors (`getTaskStats`, `getWorkload`, …) are always called with an explicit `source` argument, so the arrays are only live defaults for code that passes nothing.

One consumer does read them: **`src/components/command-search.tsx:30` imports the seed `projects` array** and maps it into the ⌘K palette, which `site-header.tsx:73` renders. The command palette therefore lists hardcoded sample projects, not the database. Treat any import of those three arrays as a bug unless the target is a fixture or a test.

## Cross-cutting rules — one authority, enforced once

- **Session validity** → `src/app/(dashboard)/layout.tsx:25`. No other module verifies a session.
- **Cookie presence** → `src/proxy.ts:14`. Deliberately weaker (no DB access); the layout is the real gate.
- **Validation** → the Zod schema at the top of each `src/db/actions/*.ts`. Do not re-validate in a component or in the store.
- **Cache invalidation** → every action calls `revalidatePath("/", "layout")`. Any new action must too, or the client context goes stale.

## Background work
None. No queues, workers, or cron.

## Pages and caching

Pages, from the filesystem: `/` (client redirect to `/landing`), `/landing`, `/sign-in`, `/sign-up`, five `/errors/*` pages, and under `(dashboard)`: `/dashboard`, `/projects`, `/projects/[id]`, `/tasks`, `/calendar`, `/users`, `/settings/{user,account,notifications,connections,billing}`. Plus the framework's `not-found.tsx`, `loading.tsx` and `favicon.ico`.

`(dashboard)` is `dynamic = "force-dynamic"` — nothing under it is prerendered or cached. **No cache tags are used anywhere.** Landing and auth pages are static.

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm build
```

No CI workflow exists and no remote is configured, so these run locally only. There is no test tier to report.

| test folder | owns |
| --- | --- |
| — | No test folders exist. |

---

# TARGET STATE — Not Yet Built

Design intent that is **not** implemented. Treat as requirements for future work, **never** as description of current behavior.

- **Per-user workspace scoping.** `getMemberId()` returns an arbitrary first row; `currentMember` is `members[0]`. Real scoping needs the session's `user.id` → `member.id` threaded into every query.
- **Authorization on mutations.** No server action checks a session or a role. `role` is decorative text.
- **A test runner.** Would close the empty gate in §13 and let the six untested invariants be verified.
- **A hermetic build.** Inter is fetched from Google at build time; a cold build with no egress fails. CI cannot go green until the font is vendored or the fallback is tolerated.
- **Email on invite.** `inviteMemberAction` writes rows and stops.
- **CI.** No `.github/`, no remote.
- **Runtime floor enforcement.** No `engines`, no `packageManager` pin.
- **Removing the seed arrays in `src/data/flowboard.ts`.** `src/components/command-search.tsx` still imports the hardcoded `projects` array, so the ⌘K palette lists sample data instead of the workspace. Either delete the arrays or repoint that consumer at `useFlowBoard()`.
- **Wiring or deleting `countOwnedProjects` / `assertMemberExists`.** Exported, never called.

---

# VERIFICATION STANDARDS — Quality guardrails

A sentence earns its place only if its author read the thing this session.

| Bad line | Why wrong | Good line |
| --- | --- | --- |
| "`member`: id, name, email, role." | There is no `name` or `email` column. Both live in `user`. | "`member`: id uuid PK, user_id → `user.id` cascade, role text, status enum, joined_at, last_active_at. **No name/email column** — identity lives in `user`." |
| "Deleting a member removes their tasks." | `assignee_id` is `ON DELETE SET NULL`. Tasks survive, unassigned. | "Deleting a member nulls `task.assignee_id` and leaves the task in place; their owned projects are transferred first because `owner_id` is `ON DELETE RESTRICT`." |
| "Tests pass." | There is no runner. The sentence describes nothing. | "No test runner is installed; `pnpm typecheck`, `pnpm lint` and `pnpm build` are the entire gate." |
| "`src/proxy.ts` guards the dashboard." | It only checks cookie presence. A stale cookie passes it. | "`src/proxy.ts` is an optimistic cookie-presence check; real verification is `auth.api.getSession()` in `(dashboard)/layout.tsx:25`." |
| "shadcn/ui with Radix primitives." | This project is on Base UI. | "shadcn `base-nova` on `@base-ui/react`; props are Base UI's, not Radix's." |
| "Use `cn()` from clsx + tailwind-merge." | Neither package is installed; `cn` is a single dependency. | "`cn()` is re-exported from the `cn` package in `src/lib/utils.ts`." |
| "Route protection is handled by middleware." | Renamed in Next 16. | "`src/proxy.ts` exports `proxy`; `middleware.ts` is the deprecated filename." |
| "The build is hermetic." | Inter is fetched from Google at build time. | "Inter comes from `next/font/google`; verify with `NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:9 pnpm build`." |

---

# FEATURE SPECS

Feature specifications live in `specs/`. One file per deliverable unit of work. See `specs/README.md` for structure and `specs/00-template.md` for the template.

---

# EDITING THIS FILE

## When to fill sections

1. **STANDING RULES (Rules 11–17)** — day one when you learn the first fact. **Done.**
2. **PROJECT OVERVIEW through PM CONVENTIONS** — as you build, one section per decision.
3. **SERVICE ARCHITECTURE** — after the first real commit, listing only implemented code. **Done.**
4. **TARGET STATE** — whenever design intent outpaces implementation.
5. **FEATURE SPECS** (`specs/`) — one per unit of work.

## Health check

```bash
grep -n '<[a-zA-Z_/]' AGENTS.md
```

Every hit outside **VERIFICATION STANDARDS** is an unfilled slot. Zero hits means this file describes FlowBoard and only FlowBoard.

## One rule that organizes everything else

**Code is the source of truth.** When implementation and docs disagree, the doc is the defect. Fix the doc in the same change.