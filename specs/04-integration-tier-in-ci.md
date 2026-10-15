# 04 — The integration tier in CI

Blocked by spec 03 (there is nothing worth running until a tier writes rows) and by an owner decision
on whether CI carries a database URL at all.

## Goal

A green check on `main` means the persistence invariants and the write path were verified, not just
the types. Today `.github/workflows/ci.yml:77` runs `pnpm test:unit`, and the job comment at `:8`
records why: the integration tier needs a `DATABASE_URL` the job deliberately does not carry.

## First increment

1. Store the scratch branch URL as a repository **secret**, referenced by name only —
   AGENTS.md rule 6, and `docs/project-context.md` → Environment lists names, never values.
2. Run `pnpm test:integration` as its own job so a schema failure reads differently from a type
   failure, and add a `concurrency` group: two runs truncating one scratch database produce a failure
   neither caused.
3. Decide when it runs. **Write this down explicitly:** a secret is reachable by a `pull_request` job
   from a fork if the workflow is configured wrongly. The safe default in this repo is `push` to
   `main` plus `pull_request` from branches in the same repo only.

## Later increments

- Flip `pnpm test:unit` to `pnpm test` once both tiers are expected to run.
- Migrations in CI: `pnpm db:generate --check` equivalent, so an uncommitted drift between
  `src/db/schema/` and `drizzle/` fails a build instead of a runtime. Unverified whether
  drizzle-kit 0.31.11 exposes such a flag — check `node_modules/drizzle-kit` before promising it.

## Deferred / open questions

- Or: the owner decides the integration tier stays local-only and that decision goes into
  `docs/target-state.md` → CI as final. That closes this spec honestly rather than leaving it open
  forever. The cost is that every persistence invariant is verified on one machine.

## Security / permissions

The database this job reaches must be the disposable one from spec 03, and the secret must not be
printable by any step — no `echo` of the env, no debug step.

## Verification

- `gh run watch` with `--exit-status`, on the run id `gh run list` reports for the pushed commit, and
  quote the per-job result. A runner image cannot be verified locally, so the run *is* the proof.
- Negative check on purpose: break one integration assertion in a scratch branch, push, and confirm CI
  goes red for the right reason. Otherwise the job has not proved anything.
- What remains unverified: whether the runner's network can reach Neon at all — measure before
  writing the job.
