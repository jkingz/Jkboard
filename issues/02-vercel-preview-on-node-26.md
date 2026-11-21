# 02: Vercel preview deploy builds on Node 26

**What to build:** A Vercel preview deploy of the branch confirms that production will build and run on the pinned Node 26.x. This settles the design's open questions about the current production Node version and the dashboard setting. Spec: `./design_draft.md`.

**Blocked by:** 01

**Status:** resolved

- [x] The preview build log shows Node 26.x and a successful build
- [x] The pnpm version Vercel used is recorded from the log (review finding M2: Vercel may ignore `packageManager` unless Corepack is enabled)
- [x] If the build fails on 26: set both Node pins to 24 together, re-run ticket 01's checks, and record the fallback in this file (not needed: the build passed on 26.x)

## Comments

- 2026-11-22: PR #9 preview deploy (`vercel inspect --logs`): `Due to "engines": { "node": "26.x" } … the Node.js Version defined in your Project Settings ("24.x") will not apply, Node.js Version "26.x" will be used instead`; `Detected pnpm-lock.yaml … from package.json#packageManager pnpm@10.18.3`; `Done in 2s using pnpm v10.18.3`; `Build Completed in /vercel/output [19s]`. M2 is moot: Vercel honours `packageManager` without Corepack. The dashboard still says 24.x; `engines` overrides it.
