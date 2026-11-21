# 03: Docs describe the pinned runtime

**What to build:** Readers of the README and project docs see the runtime that actually shipped: which Node and pnpm versions are pinned, what is enforced on install, and how CI picks them up. Spec: `./design_draft.md`.

**Blocked by:** 01, 02 (the docs must reflect what shipped, including any fallback to Node 24)

**Status:** resolved

- [x] No doc says the project has no runtime floor
- [x] The wording is accurate about enforcement: Node 26.x is enforced on install; pnpm must be at least 10.0.0, and 10.18.3 is pinned through `packageManager` in CI (review finding M3)
- [x] The "Runtime floor enforcement" section is removed from `docs/target-state.md`, including its trailing separator, and any link into it is updated
- [x] The README's "deployed nowhere" / "Production hosting: Not configured" claims are either corrected to Vercel or explicitly left as out of scope, with the choice noted here (review finding M4)

## Comments

- 2026-11-22: The runtime wording was done early on the ticket 01 branch, because docs/README.md requires docs to change in the same change as the code. That covers README.md, docs/project-context.md and the target-state section. The README deployment claims (M4) and any fallback to Node 24 still wait on 02.
- 2026-11-22: M4 corrected to Vercel (not left out of scope): `vercel ls jkboard` shows Ready Production and Preview deployments. README.md status, hosting row and readiness row, plus docs/product-overview.md Deployment line, now say Vercel. No fallback to 24 (ticket 02 passed on 26.x).
