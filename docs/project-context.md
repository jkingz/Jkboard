# Project Context — day-one slots

These are the facts an agent cannot infer from the repo without reading it.

---

## Demo access

A visitor can reach a working dashboard without creating an account. The credentials live in
`src/lib/demo.ts` and are printed on the landing page and the sign-in form.

| | |
| --- | --- |
| Email | `maya.chen@jkboard.app` |
| Password | `jkboard-2026` |
| Accounts | 8 seeded teammates share the password |
| Created by | `pnpm db:seed` then `pnpm db:seed:auth` |

The sign-in form's **"Try the live demo"** button signs in as Maya without a form round-trip.

**These credentials are public.** They are printed on a public page, so treat them as a label, not a
secret. Three consequences, all current:

1. **The workspace is shared.** Every demo visitor sees and mutates the same data. A visitor who
   deletes a project deletes it for everyone.
2. **Any authenticated session can delete anything.** No server action checks a role — see
   [target-state.md](./target-state.md). An anonymous visitor who reads the page can wipe the demo
   data.
3. **The password hash lives in the same database as real users.** If this database is ever shared
   with real accounts, rotate `DEMO_PASSWORD` and re-run `pnpm db:seed:auth --reset`.

To retire the demo without touching the code, set `NEXT_PUBLIC_DEMO_MODE=false` and re-seed without
`db:seed:auth`. Nothing in the app enforces that flag yet — it is read by `isDemoEnvironment()` in
`src/lib/demo.ts`, which the UI does not currently consult.

---

## Package manager and runtime

`pnpm` — `pnpm-lock.yaml` is the single lockfile (lockfileVersion `9.0`) and the only one committed.
Do not generate `package-lock.json` or `yarn.lock`.

**No runtime floor is declared.** `package.json` has no `engines` field and no `packageManager` pin,
and there is no `.nvmrc`, `mise.toml` or equivalent. Verified working on Node v26.8.2 with pnpm
10.18.3. Adding `engines` + `packageManager` is a deliberate open item in
[target-state.md](./target-state.md), not an oversight — until then, nothing mechanically enforces a
floor and a silent major bump is possible.

Two lockfiles is not a style opinion, it is a bug: the resolver picks one and the other rots.

Test layout:

```
tests/platform/unit/         pure selectors + Zod schemas, no DB
tests/platform/integration/  schema invariants, real DB, read-only
tests/setup-env.ts           loads .env.local for the integration tier
vitest.config.mts            two projects: unit, integration
```

---

## Commands

| Need | Command |
| --- | --- |
| Dev server | `pnpm dev` |
| Tests | `pnpm test` (both tiers) · `pnpm test:unit` · `pnpm test:integration` · `pnpm test:watch` |
| Run one test file | `pnpm test:unit tests/platform/unit/selectors.unit.test.ts` |
| Types | `pnpm typecheck` |
| Lint | `pnpm lint` (`eslint .`) |
| Build | `pnpm build` |
| Migrations | `pnpm db:generate` (new) · `pnpm db:migrate` (apply) · `pnpm db:push` (local shortcut, skips migration files) |
| Studio | `pnpm db:studio` |
| Seeding | `pnpm db:seed` (data) · `pnpm db:seed:auth` (auth users) |

Every `db:*` and seed script runs through `node --env-file=.env.local`, so `.env.local` must exist
before any of them will start.

---

## Verification gates

`pnpm typecheck` → `pnpm lint` → `pnpm test` → `pnpm build`, in that order. All four verified green.

**The test gate has two tiers, and only one of them is credential-free.**

- **`unit`** — no database, no network. Covers the pure selectors and Zod schemas in
  `src/data/jkboard.ts`. This is the tier a CI runner can always execute.
- **`integration`** — needs a real `DATABASE_URL`. It asserts the persistence invariants against
  `information_schema` and never mutates rows.

**The gap CI would not close:** the integration tier is credential-gated. It is also currently
**read-only** — it inspects schema metadata rather than inserting rows, so it cannot prove the server
actions actually write correctly. Naming the tier as covered is not the same as covering behaviour;
`pnpm test` reports both counts so a skipped tier is visible rather than silent.

Vitest does not read `.env.local`, so `tests/setup-env.ts` loads it for the integration tier.
Without that file the tier skips and looks like a pass.

---

## Framework version drift

Next.js **16.4.0** (`package.json`). Read the installed guide at `node_modules/next/dist/docs/`
before writing framework code; the copies in `node_modules` beat training data every time.

Three conventions an agent from training data gets wrong here, each confirmed against the Next.js
16 upgrade docs:

- **`middleware.ts` → `proxy.ts`.** The file is `src/proxy.ts` and exports `proxy`, not
  `middleware`. A proxy file must export exactly one function; multiple proxy functions in one file
  are unsupported. The `edge` runtime is **not** supported in `proxy` — it is `nodejs` and not
  configurable. Codemod: `npx @next/codemod@canary middleware-to-proxy .`
- **shadcn is on Base UI** (`@base-ui/react`), not Radix. Portal, overlay and ref-prop idioms differ.
- **`cn()` is the standalone `cn` package.** `clsx` and `tailwind-merge` are *not* installed —
  importing them fails.

Next.js injects its own `nextjs-agent-rules` block into `AGENTS.md` and re-adds it on every dev run
(`node_modules/next/dist/server/lib/generate-agent-files.js`). It is already at the top of the file;
leave it in place and commit it with your work.

---

## Datastore and schema

PostgreSQL on Neon, reached over HTTP by `@neondatabase/serverless` (`neon-http` driver), so it
works in serverless/edge runtimes. Schema is Drizzle with `casing: "snake_case"` declared in **both**
`drizzle.config.ts` and `src/db/index.ts` — changing one without the other silently desyncs property
names from column names.

**Table and enum names** — `user`, `session`, `account`, `verification`, `member`, `project`,
`project_member`, `task`, and the four `member_status` / `project_status` / `task_status` /
`task_priority` enums.

These are unprefixed, and they live in the `public` schema. The same database also hosts Neon's
built-in Auth under `neon_auth`, which has its own `user` table. The two coexist because they are in
different schemas and `search_path` is `public` — but **raw SQL touching `user` must quote it**
(`from "user"`), because `user` is a reserved word in Postgres. Unquoted, it fails with
`column u.id does not exist`. Drizzle quotes correctly; hand-written SQL will not.

Migrations are versioned files in `drizzle/`. **An applied migration is never edited** — append a new
one via `pnpm db:generate`. `pnpm db:push` skips the migration files entirely; do not rely on it for
schema you intend to keep.

**Two known tooling limits here, both verified:**

- `pnpm db:migrate` and `pnpm db:push` **cannot reach Neon over the HTTP driver** — drizzle-kit warns
  that `@neondatabase/serverless` "can only connect to remote Neon/Vercel Postgres/Supabase instances
  through a websocket". Applying a migration to this database therefore means executing the SQL in
  `drizzle/*.sql` over `neon()` directly, splitting on `--> statement-breakpoint`.
- `pnpm db:generate` emits the `task.reference` **default** but never emits the
  `CREATE SEQUENCE` it depends on. The first task insert fails with
  `relation "task_reference_seq" does not exist` unless the sequence is created separately.
  This is covered by an assertion in the integration tier.

---

## Environment variables

`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`. Names and empty placeholders only in
committed files (`.env.example`); `.env*` is gitignored apart from that one file.

All three must be **present** for `pnpm build` and `pnpm dev`; the `db:*` scripts load them via
`node --env-file=.env.local`.

The build **does not require them to be valid.** Verified: `pnpm build` exits 0 against the literal
placeholder `postgresql://USER:PASSWORD@HOST/neondb` from `.env.example`, because `(dashboard)` is
`force-dynamic` so nothing queries at build time. Deleting `.env.local` fails the build instead, at
page-data collection for `/projects`, with `DATABASE_URL is not set` — the step imports `db`, which
throws on a missing value.

So: **placeholders build, absence does not.** A future CI job can build without secrets but must
still supply non-empty values.

---

## Cross-cutting authority — one authority per rule

Each rule gets exactly one authority. No module may re-implement it in its own language.

| Rule | Single authority | Notes |
| --- | --- | --- |
| Session validity | `src/app/(dashboard)/layout.tsx:25` — `auth.api.getSession()` | The only such call site in `src/`. Verified by grep. |
| Cookie presence | `src/proxy.ts:14` — `proxy()` | Presence only, not validity — the proxy bundle cannot import the database. |
| Workspace read model | `src/db/queries/jkboard.ts` — `getWorkspaceData()` | All joins happen here so the UI stays on flat arrays. |
| Mutation entrypoint | `src/db/actions/*.ts` | Zod-parse, write, `revalidatePath("/", "layout")`. Nothing writes outside these files. |
| Input validation | the Zod schema atop each `src/db/actions/*.ts` | Do not re-validate in a component or in the store. |

Identity lives in Better Auth's `user` table; workspace membership lives in `member`. Neither is
duplicated.

**Deliberate bypass:** server actions carry no session check of their own. They are shielded from
anonymous callers by the `(dashboard)` route tree and the proxy, not by the action. If one is ever
called from outside `(dashboard)`, it is fully open. This is tracked in
[target-state.md](./target-state.md), not fixed.

---

## Protected foundations

Never patch a vendored component, a framework file, or third-party internals. If a foundation file
seems to need editing, the real problem is upstream of it.

- **`neon_auth.*`** — this database hosts Neon's built-in Auth. Nothing in this project may create,
  alter or drop a `neon_auth` object.
- `drizzle/*.sql` — applied migrations
- `src/db/schema/auth.ts` — mirrors Better Auth's own generated PostgreSQL schema; hand-edits desync
  from the adapter
- The `nextjs-agent-rules` block at the top of `AGENTS.md` — regenerated by `next dev`
- `src/proxy.ts`'s comment about never redirecting signed-in users away from `/sign-in` — the reason
  is a redirect loop, and it is subtle

---

## Where logic goes

```
src/app/(dashboard)/layout.tsx   session gate + workspace load; the only place getSession is called
src/app/(dashboard)/**/          routes; components live in a components/ subfolder beside each one
src/app/(auth)/                  sign-in, sign-up, error pages
src/app/landing/                 marketing page
src/app/api/auth/[...all]/       Better Auth handler — the only API route
src/components/ui/               shadcn Base UI primitives
src/components/theme-customizer/ runtime theme editor
src/components/*.tsx             app-shell pieces (sidebar, header, dialogs)
src/contexts/                    sidebar + theme React contexts
src/data/jkboard.ts            types (Zod schemas) + pure selectors; no I/O
src/data/jkboard-store.tsx     the only client-side state; optimistic updates + error sanitising
src/db/schema/                   Drizzle tables
src/db/actions/                  writes, one file per entity
src/db/queries/                  reads
src/hooks/                       use-mobile, use-theme, use-email-password, sidebar/theme
src/lib/                         auth.ts, auth-client.ts, utils.ts, fonts.ts, data-table.ts
src/config/  src/types/  src/utils/  theme presets and types
```

Protected: as listed above.

---

## Commits and PRs

Conventional prefixes: `feat:` `fix:` `style:` `perf:` `refactor:` `chore:` `docs:` `test:` `build:`
`ci:`. One logical change per commit. Subject says **why**, body ≤ 4 lines. Never commit secrets or
real env values.

No remote is configured, so PRs are not currently possible. When one is: title in the form
`feat(auth): add sign-out` — type, scope in parens, colon, imperative summary — body covering what
changed / how verified / what wasn't covered, one PR per unit, draft until green.

Review gate: `pnpm typecheck` → `pnpm lint` → `pnpm build`, in that order.

---

## Application building order

Read in this order before implementing:

1. [product-overview.md](./product-overview.md) — what this is for
2. [architecture.md](./architecture.md) — how it works today
3. [code-standards.md](./code-standards.md) — how to write in it
4. [ui.md](./ui.md) — only if the change touches the interface
5. [target-state.md](./target-state.md) — only if the change builds something that does not exist yet

Fill one section as you make each decision. Never front-load a template you have no facts for.