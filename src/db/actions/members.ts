"use server"

import "server-only"

import { eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import { member, project, user } from "@/db/schema"
import type { Member } from "@/data/flowboard"

const inviteSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  role: z.string().min(1).max(120),
})

export type InviteInput = z.infer<typeof inviteSchema>

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function toISO(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value)
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${date.getUTCFullYear()}-${month}-${day}`
}

/**
 * Creates a `user` row plus a `member` row.
 *
 * The user row is what Better Auth will adopt on the next step: it owns
 * identity and credentials, so this never duplicates auth data — it only
 * pre-creates the account that the invitee will claim by signing in.
 */
export async function inviteMemberAction(raw: InviteInput): Promise<Member> {
  const input = inviteSchema.parse(raw)
  const email = input.email.toLowerCase()

  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1)

  if (existing) {
    throw new Error("Someone with that email is already in the workspace.")
  }

  // Deterministic id so re-seeding stays idempotent; Better Auth can adopt it.
  const userId = `usr_${Buffer.from(email).toString("base64url").slice(0, 22)}`

  const [createdUser] = await db
    .insert(user)
    .values({
      id: userId,
      name: input.name,
      email,
      emailVerified: false,
    })
    .returning()

  if (!createdUser) throw new Error("User insert returned no row.")

  const [createdMember] = await db
    .insert(member)
    .values({
      userId: createdUser.id,
      role: input.role,
      status: "invited",
    })
    .returning()

  if (!createdMember) throw new Error("Member insert returned no row.")

  revalidatePath("/", "layout")

  return {
    id: createdMember.id,
    name: createdUser.name,
    email: createdUser.email,
    initials: initialsFromName(createdUser.name),
    role: createdMember.role,
    status: "Invited",
    joinedDate: toISO(createdMember.joinedAt),
    lastActive: "Invite sent just now",
  }
}

export async function setMemberStatusAction(
  memberId: string,
  status: Member["status"]
): Promise<Member> {
  const dbStatus =
    status === "Active" ? "active" : status === "Invited" ? "invited" : "away"

  const [row] = await db
    .update(member)
    .set({ status: dbStatus })
    .where(eq(member.id, memberId))
    .returning()

  if (!row) throw new Error(`Member ${memberId} was not found.`)

  revalidatePath("/", "layout")

  const [owner] = await db
    .select({ name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, row.userId))
    .limit(1)

  return {
    id: row.id,
    name: owner?.name ?? "Unknown",
    email: owner?.email ?? "",
    initials: initialsFromName(owner?.name ?? ""),
    role: row.role,
    status,
    joinedDate: toISO(row.joinedAt),
    lastActive: "Updated just now",
  }
}

/**
 * Removing a teammate deletes the auth user row, which cascades to the
 * membership and the join table. Projects they own are transferred first so the
 * `ON DELETE RESTRICT` on project.owner_id cannot block the delete.
 */
export async function removeMemberAction(memberId: string) {
  const [target] = await db
    .select()
    .from(member)
    .where(eq(member.id, memberId))
    .limit(1)

  if (!target) throw new Error(`Member ${memberId} was not found.`)

  const owned = await db
    .select({ id: project.id })
    .from(project)
    .where(eq(project.ownerId, memberId))

  if (owned.length > 0) {
    const [successor] = await db
      .select({ id: member.id })
      .from(member)
      .where(sql`${member.id} <> ${memberId}`)
      .limit(1)

    if (!successor) {
      throw new Error(
        "This member owns projects and there is nobody left to transfer them to."
      )
    }

    await db
      .update(project)
      .set({ ownerId: successor.id })
      .where(eq(project.ownerId, memberId))
  }

  // Tasks keep their place with a null assignee (ON DELETE SET NULL).
  await db.delete(user).where(eq(user.id, target.userId))

  revalidatePath("/", "layout")
  return memberId
}