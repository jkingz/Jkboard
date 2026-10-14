import "server-only"

import { asc, eq } from "drizzle-orm"

import { db } from "@/db"
import { member, project, projectMember, task, user } from "@/db/schema"
import type { Member, Project, Task } from "@/data/flowboard"

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

export async function getWorkspaceData(): Promise<WorkspaceData> {
  const [projectRows, taskRows, memberRows, projectMemberRows] =
    await Promise.all([
      db.select().from(project).orderBy(asc(project.dueDate)),
      db.select().from(task).orderBy(asc(task.dueDate)),
      db
        .select({
          id: member.id,
          userId: member.userId,
          role: member.role,
          status: member.status,
          joinedAt: member.joinedAt,
          lastActiveAt: member.lastActiveAt,
          name: user.name,
          email: user.email,
        })
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
    members: memberRows.map((row) => ({
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
    })),
  }
}

export async function getMemberId() {
  const [first] = await db.select({ id: member.id }).from(member).limit(1)
  return first?.id ?? null
}