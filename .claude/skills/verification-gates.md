---
description: Verification gates, the chain that must pass before work is complete
when: "user finishes implementation and needs to verify; asks what tests to run or how to verify a change"
---

# Verification Gates

## The chain

Work is done when, in this order:

1. **Typecheck passes** — `pnpm typecheck`
   - Proves types, not behavior.

2. **Lint passes** — `pnpm lint`
   - Code style and forbidden patterns.

3. **Production build passes** — `pnpm build`
   - Anything the build fetches over the network at build time is a latent CI failure. Inter comes from Google Fonts (`src/lib/fonts.ts`), so this gate is **not hermetic** — see below.

4. **Live exercise** — always, because there is no automated behavior check
   - The three gates above prove nothing about whether the feature works.
   - `pnpm db:push && pnpm db:seed`, then exercise the changed path in a browser.
   - Report the observation: what you did, what you saw.

## There is no test gate

**No test runner is installed** — no vitest/jest/playwright in `package.json`, no `tests/` directory. Do not report "tests pass": there is nothing to run, and a green three-gate chain is not coverage. When a runner is added, insert it as gate 1 and update STANDING RULES §13.

The six invariants in AGENTS.md § ARCHITECTURE CONTEXT are untested and are the first candidates.

## Reporting

For each gate:
- State what you ran
- Quote the output or count
- Say whether it passed or failed

Example:
```
Typecheck: pnpm typecheck
→ No errors

Lint: pnpm lint
→ No violations

Build: pnpm build
→ Compiled successfully, 0 errors

Live: pnpm db:push && pnpm db:seed, then dragged a task between
kanban columns in the browser; it persisted across reload
```

## A gate that only passes on your machine is not a gate

Anything fetched at build time over the network is a latent CI failure. This project fetches **Inter from Google Fonts** at build time. **A warm `.next` masks this** — the blackholed build exits 0 until you clear the cache. Always test cold:

```bash
rm -rf .next && NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:9 pnpm build
```

Verified: exit 0 with a warm cache, exit 1 cold with `Error while requesting resource … fonts.googleapis.com`. A sealed CI runner has no egress and will fail. Gate 3 cannot be trusted until the font is vendored.

Anything that needs your machine's environment state is not verified — that includes `.env.local`. The build must find `DATABASE_URL`, `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` **present**, though the placeholder values in `.env.example` are enough: nothing queries at build time because `(dashboard)` is `force-dynamic`. Removing `.env.local` fails the build at page-data collection.

## CI verification

None. There is no `.github/workflows/` and no remote configured, so these gates run locally only. Nothing runs on push or pull request today.

## Reference

- STANDING RULES §13 for the gate chain and the missing test gate
- CODE STANDARDS § Testing for the tier structure to adopt if a runner is added
- PM CONVENTIONS § Review gate for the merge requirement