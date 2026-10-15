# 09 — Runtime floor, migration path, deployment

The floor is unblocked. Deployment is blocked by the owner picking a target — `docs/product-overview.md:35`
records that none is configured.

## Goal

A clean checkout on a machine with nothing installed comes up and deploys by following
`docs/project-context.md`, the version of Node and pnpm it gets is the one the app declares, and one
documented path applies schema changes to the live database.

## Why it is open

- `package.json` has no `engines` and no `packageManager` (verified by grep), and there is no
  `.nvmrc` (glob for the file returns nothing). CI supplies the version by literal:
  `.github/workflows/ci.yml` uses `setup-node` with `node-version: 26`, and pins
  `runs-on: ubuntu-24.04` with the reason recorded in that file.
- `pnpm-workspace.yaml` is not a workspace; it exists to hold `onlyBuiltDependencies` for `esbuild`
  and `unrs-resolver`, which pnpm 10 otherwise refuses to run postinstall for.
- Both `db:push` and `db:migrate` are scripted. For a database with real rows, `push` is the wrong
  verb, and nothing in the docs says which one production uses.
- `.env.example` carries three placeholder variables and no deployment target, so "run it in
  production" is currently unanswerable from the repo.

## First increment

1. Declare the floor: `engines.node`, `packageManager`, and a `.nvmrc` matching them; then make CI
   install from what is declared instead of repeating the number twice.
2. Write the migration rule into `docs/project-context.md`: `db:generate` locally, commit the SQL and
   `drizzle/meta/` snapshots (the tree already carries `drizzle/0001_confused_joshua_kane.sql` and its
   snapshot), `db:migrate` against the target, and `db:push` is for a scratch database only.
3. Pick the deployment target and record, by name, every variable it needs. Values never enter the
   repo.

## Later increments

- `pnpm build` is already proven hermetic — Inter is vendored to `src/lib/fonts/` and the blackholed
  build passes (`docs/verification-standards.md`, `/verification-gates`). Keep the cold-sealed build as
  a release step, not a local habit.
- A rollback for migrations. Drizzle's generated SQL is forward-only; decide between a restore of a
  pre-deploy branch and hand-written down migrations before the first production schema change.
- Observability: nothing in the repo collects server-action errors. `src/lib/error-message.ts`
  normalises them for the client, which is not the same as seeing them. Unverified: whether the
  chosen host provides logs adequate to that.

## Deferred / open questions

- The deployment target itself. Everything after step 3 waits on it.
- Whether the Neon project this app uses is development-only or the one that goes to production — and
  if the latter, specs 03/04 must not point at it.

## Security / permissions

A deployment changes the threat model: the printed demo credentials (`src/lib/demo.ts:15,18`) are
public by design, and once the app is reachable by strangers the missing guards in specs 01 and 02 stop
being hypothetical. **Order matters: 01 before this goes public.**

Also unverified and needed before deploy: which `BETTER_AUTH_URL` the production origin uses, and
whether Better Auth's origin checking is configured — a wildcard here turns into an auth bypass.

## Verification

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` — then the sealed build:
  `rm -rf .next && NODE_USE_ENV_PROXY=1 HTTP_PROXY=http://127.0.0.1:9 HTTPS_PROXY=http://127.0.0.1:9 pnpm build`
  must still exit 0.
- The floor is proved by deleting the version from the environment, not by asserting the field
  exists: install with the declared `packageManager` on a clean clone and record what it picked.
- Migration path is proved by applying it to a scratch database and diffing `information_schema`
  against the working one — the read-only integration tier already queries those views.
- What remains unverified: the deployment itself, until a target exists.
