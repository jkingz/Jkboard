/**
 * Gives the seeded teammates working email/password credentials so the demo
 * can be signed into without registering a brand new account.
 *
 *   pnpm db:seed:auth
 *
 * Better Auth stores the password hash on the `account` row with
 * providerId = "credential" and accountId = user.id. Existing accounts are
 * left untouched; use --reset to overwrite their password.
 */
import { hashPassword } from "better-auth/crypto"
import { eq, sql } from "drizzle-orm"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "../src/db/schema/index.ts"

const DEMO_PASSWORD = "flowboard-2026"
const RESET = process.argv.includes("--reset")

async function main() {
  const url = process.env.DATABASE_URL

  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.")
  }

  const db = drizzle(neon(url), { schema })

  const users = await db
    .select({ id: schema.user.id, email: schema.user.email })
    .from(schema.user)
    .orderBy(schema.user.createdAt)

  if (users.length === 0) {
    throw new Error("No users found. Run `pnpm db:seed` first.")
  }

  let created = 0
  let skipped = 0

  for (const user of users) {
    const [existing] = await db
      .select({ id: schema.account.id })
      .from(schema.account)
      .where(
        sql`${schema.account.userId} = ${user.id} and ${schema.account.providerId} = 'credential'`
      )
      .limit(1)

    if (existing && !RESET) {
      skipped += 1
      continue
    }

    const password = await hashPassword(DEMO_PASSWORD)

    if (existing) {
      await db
        .update(schema.account)
        .set({ password, updatedAt: new Date() })
        .where(eq(schema.account.id, existing.id))
      continue
    }

    await db.insert(schema.account).values({
      id: crypto.randomUUID(),
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password,
    })

    created += 1
  }

  console.log(
    `Accounts ready: ${created} created, ${skipped} already existed.` +
      (RESET ? " (passwords reset)" : "")
  )
  console.log(`\nSign in with any of these and the password "${DEMO_PASSWORD}":`)
  for (const user of users.slice(0, 4)) {
    console.log(`  ${user.email}`)
  }
  if (users.length > 4) console.log(`  ... and ${users.length - 4} more`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })