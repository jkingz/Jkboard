---
name: e2e-testing-playwright
description: Playwright E2E test suite added with 3-tier testing architecture (unit + interface + E2E)
metadata:
  type: project
---

# Playwright E2E Testing Infrastructure

Added complete E2E testing stack using Playwright to complement existing unit and interface test tiers.

## What was added

**Packages installed:**
- `@playwright/test@1.64.1`

**Configuration files:**
- `playwright.config.ts` - Full configuration with multi-browser support
  - Chromium, Firefox, WebKit (desktop)
  - Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
  - Edge and Chrome channels

**Test files created:**
- `tests/e2e/landing.e2e.spec.ts` - Landing page verification tests
  - Page load and navigation
  - Feature section visibility
  - Mobile viewport responsiveness

**New npm scripts:**
- `pnpm test:e2e` - Run all E2E tests headless
- `pnpm test:e2e:ui` - Open interactive Playwright UI
- `pnpm test:e2e:headed` - Run tests in visible browser
- `pnpm test:e2e:codegen` - Auto-generate tests from browser actions

**Documentation updated:**
- [`specs/10-playwright-e2e.md`](../../specs/10-playwright-e2e.md) - E2E spec
- [`docs/pipeline.md`](../../docs/pipeline.md) - Updated build stages to include E2E
- [`scripts/pipeline-verify.sh`](../../scripts/pipeline-verify.sh) - Added E2E checks
- [`specs/README.md`](../../specs/README.md) - Added #10 to production-readiness table

## Testing hierarchy

| Tier | Tool | Purpose | CI Status |
|------|------|---------|-----------|
| Unit | Vitest | Pure modules, imports, structural rules | ✅ Always runs |
| Interface | Vitest + jsdom | React components, DOM rendering, console warnings | ✅ Always runs |
| E2E | Playwright | Full browser, network flows, user journeys | ✅ Runs on all browsers |

## Usage examples

```bash
# Local development
pnpm test:e2e                          # Run all tests in headless mode
pnpm test:e2e:ui                       # Interactive Playwright UI for debugging
pnpm test:e2e:headed -- grep "should load"  # Run specific test in visible browser

# Codegen new tests
pnpm test:e2e:codegen http://localhost:3000

# Debug failing test with trace/video/screenshot
pnpm test:e2e --project chromium       # Artifacts saved to test-results/
```

## Future work

- Add CRUD operation tests (tasks, projects)
- Add auth flow tests (sign-up, sign-in, session persistence)
- Consider visual regression testing (optional)
- Add integration with CI workflow

---

**Created:** 2026-10-17  
**Spec:** [`specs/10-playwright-e2e.md`](../../specs/10-playwright-e2e.md)
