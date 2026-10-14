# Project Context — day-one slots

These are the facts an agent cannot infer from the repo without reading it.

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

---

## Commands

| Need | Command |
| --- | --- |
| Dev server | `pnpm dev` |
| Tests | **none — no runner installed.** See [Verification gates](#verification-gates) below. |
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

`pnpm typecheck` → `pnpm lint` → `pnpm build`, in that order. All three verified green.

**There is no test gate, because there is no test runner.** `package.json` has no vitest, jest or
playwright dependency and the repo has no `tests/` directory. This is a known, accepted gap — not a
pass. A green three-gate chain proves types, lint and build; it says nothing about behavior.
`/verification-gates` adds a mandatory live browser exercise to cover that, and
[target-state.md](./target-state.md) tracks adding a runner.

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

Migrations are versioned files in `drizzle/` (`0000_fixed_jetstream.sql`, `0001_add_task_reference.sql`
plus `drizzle/meta/`). **An applied migration is never edited** — append a new one via
`pnpm db:generate`. `pnpm db:push` skips the migration files entirely; do not rely on it for schema
you intend to keep.

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
| Workspace read model | `src/db/queries/flowboard.ts` — `getWorkspaceData()` | All joins happen here so the UI stays on flat arrays. |
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

- `drizzle/0000_*.sql`, `drizzle/0001_*.sql` — applied migrations
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
src/data/flowboard.ts            types (Zod schemas) + pure selectors; no I/O
src/data/flowboard-store.tsx     the only client-side state; optimistic updates + error sanitising
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