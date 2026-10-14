import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

/**
 * Two tiers, split the way they are split on disk.
 *
 * `unit` runs anywhere — no database, no network. It covers the pure modules:
 * the selectors and Zod schemas in `src/data/flowboard.ts`, and the seed
 * fixtures. This is the tier CI would run.
 *
 * `integration` needs a real `DATABASE_URL`. It is credential-gated on purpose:
 * `tests/platform/integration/helpers.ts` detects the `.env.example` placeholder
 * and skips with a stated reason, so the tier never exits 0 having silently
 * collected nothing. See `docs/project-context.md` → Verification gates for the
 * gap this leaves in CI.
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
    ],
  },
})