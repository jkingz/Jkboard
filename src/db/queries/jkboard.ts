import "server-only"

import { asc, eq } from "drizzle-orm"

import { db } from "@/db"
import { member, project, projectMember, task, user } from "@/db/schema"
import type { Member, Project, Task } from "@/data/jkboard"

/**
 * Read model for the workspace.
 *
 * The UI works with flat arrays (`project.memberIds`, `task.assigneeId`) so the
 * store and every page can stay simple; the joins happen here.
 */

export interface WorkspaceData {
  projects: Project[]
  tasks: Task[]
  members: Member[]
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function toISODate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value)
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${date.getUTCFullYear()}-${month}-${day}`
}

function humaniseLastActive(value: Date | null) {
  if (!value) return "Never signed in"

  const diffMs = Date.now() - value.getTime()
  const minutes = Math.round(diffMs / 60_000)

  if (minutes < 1) return "Active now"
  if (minutes < 60) return `${minutes} min ago`
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`
  if (minutes < 60 * 24 * 7) return `${Math.round(minutes / (60 * 24))} d ago`

  return value.toISOString().slice(0, 10)
}

/**
 * The `member ⋈ user` projection: every `member` column plus the identity
 * fields the UI shows. Shared by the workspace read and by
 * `getMemberByUserId`, so "what a member is" has exactly one definition.
 */
const memberColumns = {
  id: member.id,
  userId: member.userId,
  role: member.role,
  status: member.status,
  joinedAt: member.joinedAt,
  lastActiveAt: member.lastActiveAt,
  name: user.name,
  email: user.email,
}

/** Typed as the schema itself, so adding a column here cannot go unnoticed. */
function toMember(
  row: typeof member.$inferSelect & { name: string; email: string }
): Member {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    initials: initialsFromName(row.name),
    role: row.role,
    status:
      row.status === "active"
        ? "Active"
        : row.status === "invited"
          ? "Invited"
          : "Away",
    joinedDate: toISODate(row.joinedAt),
    lastActive: humaniseLastActive(row.lastActiveAt),
  }
}

export async function getWorkspaceData(): Promise<WorkspaceData> {
  const [projectRows, taskRows, memberRows, projectMemberRows] =
    await Promise.all([
      db.select().from(project).orderBy(asc(project.dueDate)),
      db.select().from(task).orderBy(asc(task.dueDate)),
      db
        .select(memberColumns)
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .orderBy(asc(member.joinedAt)),
      db.select().from(projectMember),
    ])

  const membershipsByProject = new Map<string, string[]>()
  for (const row of projectMemberRows) {
    const list = membershipsByProject.get(row.projectId) ?? []
    list.push(row.memberId)
    membershipsByProject.set(row.projectId, list)
  }

  return {
    projects: projectRows.map((row) => ({
      id: row.id,
      name: row.name,
      key: row.key,
      description: row.description,
      status: row.status,
      color: row.color,
      startDate: toISODate(row.startDate),
      dueDate: toISODate(row.dueDate),
      memberIds: membershipsByProject.get(row.id) ?? [],
    })),
    tasks: taskRows.map((row) => ({
      id: row.id,
      reference: row.reference,
      title: row.title,
      projectId: row.projectId,
      status: row.status,
      priority: row.priority,
      // A removed assignee leaves a null in the database.
      assigneeId: row.assigneeId ?? "",
      dueDate: toISODate(row.dueDate),
    })),
    members: memberRows.map(toMember),
  }
}

/**
 * The caller's own membership, addressed by the unique `member_userId_uidx`.
 *
 * Returns `null` for a `user` row with no `member` row. Sign-up normally makes
 * both at once (`src/lib/auth.ts:76`, `databaseHooks.user.create.after`), so a
 * null means the membership is missing rather than the account being new — the
 * state a pre-hook row or a hand-inserted `user` ends up in. Callers must handle
 * it rather than falling back to a positional guess: the read this replaces,
 * `getMemberId()`, selected the first `member` row with no `where`, so every
 * caller in the workspace was treated as whoever joined earliest.
 */
export async function getMemberByUserId(
  userId: string
): Promise<Member | null> {
  const [row] = await db
    .select(memberColumns)
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.userId, userId))
    .limit(1)

  return row ? toMember(row) : null
}