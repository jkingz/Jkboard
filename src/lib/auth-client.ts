"use client"

import { createAuthClient } from "better-auth/react"

/**
 * Client for the Better Auth endpoints mounted at /api/auth/*.
 *
 * Kept in its own module so client components never touch the server-only
 * `auth` instance in `@/lib/auth`.
 */
export const authClient = createAuthClient()

export const { signIn, signUp, signOut, useSession } = authClient