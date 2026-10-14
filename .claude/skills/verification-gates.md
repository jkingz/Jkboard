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
   - Code style and forbidden patterns. Note: the six `jsx-a11y` rules ship as **warnings**, so lint
     exits 0 with them — see [docs/ui.md](../../docs/ui.md) → Accessibility.

3. **Tests pass** — `pnpm test`
   - **Name the tier it covered.** `pnpm test` runs both; the integration tier skips with a stated
     reason when there is no real `DATABASE_URL`, and a skip is not a pass.
   - Report the command and the counts.

4. **Production build passes** — `pnpm build`
   - Anything the build fetches over the network is a latent CI failure. Inter comes from Google Fonts
     (`src/lib/fonts.ts`), so this gate is **not hermetic** — see below.

5. **Live exercise** — always
   - The four gates above do not prove the feature works in a browser.
   - `pnpm db:seed`, then exercise the changed path.
   - Report the observation: what you did, what you saw.

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

Tests: pnpm test
→ 25 passed | 1 skipped (26)   [unit + integration; integration needs DATABASE_URL]

Build: pnpm build
→ Compiled successfully, 0 errors

Live: pnpm db:seed, then dragged a task between kanban columns
in the browser; it persisted across reload
```

## A gate that only passes on your machine is not a gate

**Test the build cold.** Inter is fetched from Google Fonts at build time, and **a warm `.next` masks
it** — the blackholed build exits 0 until you clear the cache:

```bash
rm -rf .next && NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:9 pnpm build
```

Verified: exit 0 warm, exit 1 cold with `Error while requesting resource … fonts.googleapis.com`.
A sealed CI runner has no egress and will fail. Tracked in
[docs/target-state.md](../../docs/target-state.md).

**Tests are just as machine-dependent.** The unit tier needs nothing; the integration tier needs a
real database. Say which one you ran.

## Reporting a tier that skipped

Never report "tests pass" when a tier skipped. Say so, and say why:

> Tests: `pnpm test` → 17 passed, unit tier only. The integration tier skipped because
> `DATABASE_URL` is the `.env.example` placeholder. Persistence invariants are therefore unverified.

## CI verification

None. There is no `.github/workflows/` and no remote configured, so these gates run locally only.
Nothing runs on push or pull request today.

## Reference

- [docs/project-context.md](../../docs/project-context.md) → Verification gates
- [docs/architecture.md](../../docs/architecture.md) → Invariants, and which have tests
- `/testing` for tier structure and the traps this setup has already hit