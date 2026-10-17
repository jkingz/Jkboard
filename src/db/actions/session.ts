import "server-only"

import { headers } from "next/headers"

import { getMemberByUserId } from "@/db/queries/jkboard"
import { auth } from "@/lib/auth"

/**
 * The one authority the write path checks its caller against.
 *
 * Server actions are reachable by POST to the route Next generates for them,
 * from any page or none, so the layout's session check
 * (`src/app/(dashboard)/layout.tsx:26`) guards *rendering*, not *invocation*,
 * and `src/proxy.ts:29` only tests whether the cookie is present. Every
 * mutation therefore calls this first.
 *
 * Returns the caller's `member.id` — enough to own a row — and throws
 * otherwise. The read is the same one the layout uses to name the signed-in
 * person, so the two cannot disagree about who is calling.
 *
 * Deliberately **not** authorization: under one shared workspace every member
 * may write every row, so "there is a session and it belongs to a member" is
 * the whole of what this proves. Role checks are `specs/02`; per-row ownership
 * is recorded in `specs/01` → "Later increments".
 */
export async function requireMembership(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    throw new Error("You are not signed in.")
  }

  const membership = await getMemberByUserId(session.user.id)

  if (!membership) {
    throw new Error("This account is not a member of the workspace yet.")
  }

  return membership.id
}
