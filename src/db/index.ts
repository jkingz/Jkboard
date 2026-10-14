import "server-only"

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "./schema"

/**
 * Server-only database handle.
 *
 * `@neondatabase/serverless` speaks HTTP rather than raw TCP, which is what
 * Neon's pooled endpoint expects and what works in edge/serverless runtimes.
 * Nothing in this file may be imported from a client component.
 */
function connectionString() {
  const url = process.env.DATABASE_URL

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in."
    )
  }

  return url
}

const globalForDb = globalThis as unknown as {
  flowboardDb?: ReturnType<typeof drizzle<typeof schema>>
}

/** Reuse one client across hot reloads in development. */
export const db =
  globalForDb.flowboardDb ??
  drizzle(neon(connectionString()), { schema, casing: "snake_case" })

if (process.env.NODE_ENV !== "production") {
  globalForDb.flowboardDb = db
}

export { schema }
export type Database = typeof db