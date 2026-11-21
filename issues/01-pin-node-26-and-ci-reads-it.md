# 01: Pin Node 26, refuse other Node versions on install, and have CI read the pins

**What to build:** The repo declares Node 26.x as the only supported Node, for Vercel and pnpm, and in an `.nvmrc` for CI and local version managers. Installing dependencies on any other Node major fails instead of warning. CI sets up Node and pnpm from the repo's own pins, with no version numbers written in the workflow. Spec: `./design_draft.md`.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] `engines.node` is `26.x`; `engines.pnpm` and `packageManager` (`pnpm@10.18.3`) are unchanged
- [x] `.nvmrc` contains `26`
- [x] Strict engine checking is on. Try `engineStrict: true` in the existing pnpm config file first (review finding M1); use `.npmrc` `engine-strict=true` only if pnpm ignores the first
- [x] `pnpm install` on Node 24 exits non-zero with `ERR_PNPM_UNSUPPORTED_ENGINE`
- [x] `pnpm install` on Node 26 succeeds with no engine warning
- [x] The CI workflow has no hard-coded Node or pnpm version; the CI log shows Node 26.x from `.nvmrc` and pnpm 10.18.3 from `packageManager`, and every job passes
- [x] `pnpm typecheck && pnpm lint && pnpm test:unit && pnpm build` passes on Node 26

## Comments

- 2026-11-22: Implemented. `engineStrict: true` in `pnpm-workspace.yaml` works (no `.npmrc` needed): with it, `pnpm install` on Node v24.22.3 exits 1 with `ERR_PNPM_UNSUPPORTED_ENGINE`; with it removed, the same install exits 0. Node 26.8.2 install passes. Checks pass on Node 26; `pnpm build` needs `NODE_ENV` unset, since a shell `NODE_ENV=development` breaks prerender of `/_global-error` (also on `main`, not caused by this change). The CI-log criterion stays open until the PR's CI run.
- 2026-11-22: PR #9 CI run 44954056299 passed; log shows `node: v26.13.1` (from `.nvmrc`) and `Done in 2.7s using pnpm v10.18.3` (from `packageManager`).
