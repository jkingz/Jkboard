import "server-only"

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"

import { db } from "@/db"
import { member } from "@/db/schema"
import * as schema from "@/db/schema"

/**
 * Better Auth, wired to the existing Neon + Drizzle setup.
 *
 * The `user` / `session` / `account` / `verification` tables are the ones
 * created by migration 0000 and they already match Better Auth's expected
 * PostgreSQL schema, so no extra tables or duplicate identity data exist.
 *
 * `nextCookies` must stay last so server actions can set the session cookie.
 */
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

  /**
   * Better Auth rejects cross-origin writes by default.
   *
   * The configured URL is always trusted, plus the origin the request actually
   * arrived on — which is same-origin only, so this never widens CORS. Deriving
   * it per request means the app works on any localhost port in development.
   */
  trustedOrigins: (request?: Request) => {
    const origins = [
      process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]

    if (request) {
      try {
        origins.push(new URL(request.url).origin)
      } catch {
        // Non-absolute URL: nothing extra to trust.
      }
    }

    return origins
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    // 8 characters, at least one number.
    minPasswordLength: 8,
    autoSignIn: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // one week
    updateAge: 60 * 60 * 24, // refresh the cookie once a day
  },

  user: {
    // A brand new account starts as an invited-but-unconfirmed teammate,
    // mirroring the member rows created by the seed script.
    additionalFields: {},
  },

  databaseHooks: {
    /**
     * Identity lives in `user`; workspace membership lives in `member`.
     * Creating the membership here means a self-service sign-up is immediately
     * usable across the workspace instead of landing with no membership row.
     */
    user: {
      create: {
        after: async (createdUser) => {
          await db
            .insert(member)
            .values({
              userId: createdUser.id,
              role: "Member",
              status: "invited",
            })
            .onConflictDoNothing()
        },
      },
    },
  },

  advanced: {
    database: {
      // Generate ids in the same style as the seeded rows.
      generateId: () => crypto.randomUUID(),
    },
  },

  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
export type SessionUser = Session["user"]