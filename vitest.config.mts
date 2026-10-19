import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

/**
 * Three tiers, split the way they are split on disk.
 *
 * `unit` runs anywhere — no database, no network. It covers the pure modules
 * (selectors, date helpers, Zod/view-model coherence), `proxy()` called
 * in-process, and the source-tree structural rules behind invariants 1 and 4.
 * This is the tier CI runs.
 *
 * `integration` needs a real `DATABASE_URL`. It is credential-gated on purpose:
 * `tests/platform/integration/helpers.ts` detects the `.env.example` placeholder
 * and skips with a stated reason, so the tier never exits 0 having silently
 * collected nothing. See `docs/project-context.md` → Verification gates for the
 * gap this leaves in CI.
 *
 * `interface` renders components in jsdom to catch DOM-tier defects like
 * hydration mismatches and uncontrolled component warnings that unit tests
 * cannot see. Runs alongside unit tests in CI as part of `pnpm test`.
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["tests/**/*.unit.test.ts"],
          environment: "node",
        },
        resolve: {
          alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
          },
        },
      },
      {
        test: {
          name: "integration",
          include: ["tests/**/*.integration.test.ts"],
          environment: "node",
          setupFiles: ["tests/setup-env.ts"],
        },
        resolve: {
          alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
          },
        },
      },
      {
        test: {
          name: "interface",
          include: ["tests/**/*.interface.test.{ts,tsx}"],
          environment: "jsdom",
          globals: true,
          jsx: true,
        },
        resolve: {
          alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
          },
        },
      },
    ],
  },
})