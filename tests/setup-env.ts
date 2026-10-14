/**
 * Loads `.env.local` for the integration tier.
 *
 * Vitest does not read `.env.local` the way `next dev` does, and the `db:*`
 * scripts only work because they are wrapped in `node --env-file=.env.local`.
 * Without this the integration tier sees no `DATABASE_URL` and skips — which
 * looks identical to a passing run that collected nothing.
 *
 * Values are never logged. Only the *presence* of the variable is reported, and
 * never its contents.
 */
import { existsSync } from "node:fs"
import { resolve } from "node:path"

const envPath = resolve(process.cwd(), ".env.local")

if (existsSync(envPath)) {
  process.loadEnvFile(envPath)
}

if (process.env.DATABASE_URL) {
  // Presence only — never the value.
  const isPlaceholder = process.env.DATABASE_URL.includes("USER:PASSWORD@HOST")
  console.log(
    `[test setup] DATABASE_URL loaded from .env.local${
      isPlaceholder ? " (placeholder value)" : ""
    }`
  )
} else {
  console.log(
    "[test setup] DATABASE_URL not set — the integration tier will skip."
  )
}