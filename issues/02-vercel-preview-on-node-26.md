# 02: Vercel preview deploy builds on Node 26

**What to build:** A Vercel preview deploy of the branch confirms that production will build and run on the pinned Node 26.x. This settles the design's open questions about the current production Node version and the dashboard setting. Spec: `./design_draft.md`.

**Blocked by:** 01

**Status:** ready-for-human (only the owner can read the Vercel dashboard and deploy logs)

- [ ] The preview build log shows Node 26.x and a successful build
- [ ] The pnpm version Vercel used is recorded from the log (review finding M2: Vercel may ignore `packageManager` unless Corepack is enabled)
- [ ] If the build fails on 26: set both Node pins to 24 together, re-run ticket 01's checks, and record the fallback in this file
