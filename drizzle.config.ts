import { defineConfig } from "drizzle-kit"

/**
 * Drizzle Kit reads DATABASE_URL directly. It is only ever loaded from
 * .env.local (gitignored) — never committed.
 */
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local before running migrations."
  )
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
})