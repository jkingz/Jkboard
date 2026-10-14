import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"

import * as schema from "@/db/schema"

/**
 * Integration-tier helpers.
 *
 * This tier is credential-gated: it needs a real Postgres. `hasDatabase()`
 * exists so a missing `DATABASE_URL` is a **reported skip with a stated
 * reason**, never a silent pass. A suite that collected zero files and exited
 * 0 is indistinguishable from coverage, and that is exactly the failure mode
 * these helpers exist to prevent.
 */

/**
 * True when `DATABASE_URL` is present AND not the placeholder shipped in
 * `.env.example`. Placeholder detection matters: the file exists in every
 * fresh clone, so checking only for presence would report a usable database
 * when there is none.
 */
export function hasDatabase() {
  const url = process.env.DATABASE_URL

  if (!url) return false
  if (url.includes("USER:PASSWORD@HOST")) return false

  return true
}

/** The reason to print when skipping, so the gap is never silent. */
export function skipReason() {
  if (!process.env.DATABASE_URL) {
    return "DATABASE_URL is not set"
  }
  if (!hasDatabase()) {
    return "DATABASE_URL is still the .env.example placeholder"
  }
  return "unknown"
}

/**
 * A Drizzle handle mirroring `src/db/index.ts`. It deliberately does NOT import
 * `@/db`: that module is marked `server-only`, whose default export throws on
 * import outside a React Server Component graph. Building the handle here keeps
 * the integration tier runnable under plain Node.
 */
export function testDb() {
  return drizzle(neon(process.env.DATABASE_URL!), {
    schema,
    casing: "snake_case",
  })
}

/**
 * `db.execute()` returns a driver result object, not an array. Unwrap `.rows`
 * here so assertions read as plain data. Calling `.map()` straight on an
 * `execute()` result fails at runtime — the result is not iterable.
 */
export function rowsOf<T = Record<string, unknown>>(
  result: unknown
): Array<T> {
  const rows = (result as { rows?: unknown }).rows
  return Array.isArray(rows) ? (rows as Array<T>) : []
}

export { schema }