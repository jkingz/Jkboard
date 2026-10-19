# 10 — Playwright E2E Test Suite

Unblocked after specs 03 (integration tests with write path) and 04 (CI integration tier).

## Goal

Add a third testing tier using Playwright that renders the app in real browsers, catches browser-specific defects, and verifies complete user journeys end-to-end.

## Why it is needed

Unit and interface tiers cannot catch:
- **Browser-specific rendering issues** (CSS layout bugs, animations, scroll behavior)
- **Real network request failures** (auth flows, API responses)
- **State transitions across routes** (sign-up → login → dashboard)
- **Production build differences** (tree-shaking, bundling effects)

The `playwright-cli` tooling is already available in use; this wires it into actual tests.

## First increment

1. Install `@playwright/test` and configure basic setup
2. Create initial test suite: landing page verification
3. Run tests against all major browsers (Chromium, Firefox, WebKit) + mobile viewports
4. Configure CI to run on every push/PR

## Later increments

- Integration tests with seeded database (tasks CRUD, kanban interactions)
- Auth flow testing (sign-up, sign-in, session persistence)
- Regression test suite tied to critical paths
- Visual regression snapshots (optional, if budget allows)

## Deferred / open questions

- Should we add visual regression testing? (requires separate infrastructure)
- What's the minimum browser coverage vs full matrix?
- Should tests run in parallel or serialized (for shared DB)?

## Security / permissions

None — purely a testing layer. Tests run against development or test instances only.

## Verification

```bash
# Local development
pnpm test:e2e                          # Run all tests in headless mode
pnpm test:e2e:ui                       # Open Playwright UI for interactive debugging
pnpm test:e2e:headed                   # Run tests in visible browser
pnpm test:e2e:codegen http://localhost:3000  # Auto-generate tests from clicks

# CI (via vitest pipeline or playwright directly)
CI=true pnpm test:e2e --project chromium
```

---

**Next step:** Implement first increment (see "First increment" above).
