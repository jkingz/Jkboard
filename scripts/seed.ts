/**
 * Seeds the FlowBoard development database with the sample workspace that the
 * UI previously kept in memory.
 *
 *   pnpm db:seed
 *
 * Safe to re-run: every table is cleared first.
 */
import { neon } from "@neondatabase/serverless"
import { count, sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "../src/db/schema/index.ts"
import { seedMembers, seedProjects, seedTaskSeeds } from "./seed-data.ts"

async function main() {
  const url = process.env.DATABASE_URL

  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.")
  }

  const db = drizzle(neon(url), { schema })

  console.log("Clearing existing workspace data...")
  // order matters: children first, then parents
  await db.delete(schema.task)
  await db.delete(schema.projectMember)
  await db.delete(schema.project)
  await db.delete(schema.member)
  await db.delete(schema.session)
  await db.delete(schema.account)
  await db.delete(schema.user)

  console.log("Seeding users and members...")

  const [userRows, memberRows] = await Promise.all([
    db
      .insert(schema.user)
      .values(
        seedMembers.map((entry) => ({
          id: entry.userId,
          name: entry.name,
          email: entry.email,
          emailVerified: true,
        }))
      )
      .returning({ id: schema.user.id }),

    db
      .insert(schema.member)
      .values(
        seedMembers.map((entry) => ({
          userId: entry.userId,
          role: entry.role,
          status: entry.status,
          joinedAt: new Date(`${entry.joinedAt}T00:00:00.000Z`),
          lastActiveAt: entry.lastActiveAt,
        }))
      )
      .returning({ id: schema.member.id, userId: schema.member.userId }),
  ])

  if (userRows.length !== seedMembers.length) {
    throw new Error(
      `Expected ${seedMembers.length} users, inserted ${userRows.length}.`
    )
  }

  const memberIdByUserId = new Map(
    memberRows.map((row) => [row.userId, row.id] as const)
  )

  console.log("Seeding projects...")
  const projectRows = await db
    .insert(schema.project)
    .values(
      seedProjects.map((entry) => ({
        name: entry.name,
        key: entry.key,
        description: entry.description,
        status: entry.status,
        color: entry.color,
        ownerId: memberIdByUserId.get(entry.ownerUserId)!,
        startDate: entry.startDate,
        dueDate: entry.dueDate,
      }))
    )
    .returning({ id: schema.project.id, key: schema.project.key })

  const projectIdByKey = new Map(
    projectRows.map((row) => [row.key, row.id] as const)
  )

  console.log("Seeding project memberships...")
  const memberships = seedProjects.flatMap((entry) =>
    entry.memberUserIds.map((userId) => ({
      projectId: projectIdByKey.get(entry.key)!,
      memberId: memberIdByUserId.get(userId)!,
    }))
  )

  if (memberships.length > 0) {
    await db.insert(schema.projectMember).values(memberships)
  }

  console.log("Seeding tasks...")
  // Restart the reference sequence so keys read TSK-0001, TSK-0002, ...
  await db.execute(sql`select setval('task_reference_seq', 1, false)`)

  const taskValues = seedTaskSeeds.map(
    ([title, projectKey, status, priority, assigneeUserId, dueOffset], index) => ({
      projectId: projectIdByKey.get(projectKey)!,
      title,
      status,
      priority,
      assigneeId: memberIdByUserId.get(assigneeUserId) ?? null,
      dueDate: new Date(Date.now() + dueOffset * 86_400_000)
        .toISOString()
        .slice(0, 10),
      position: index,
      completedAt: status === "completed" ? new Date() : null,
    })
  )

  await db.insert(schema.task).values(taskValues)

  const [userCount] = await db
    .select({ value: count() })
    .from(schema.user)
  const [projectCount] = await db
    .select({ value: count() })
    .from(schema.project)
  const [taskCount] = await db.select({ value: count() }).from(schema.task)
  const [memberCount] = await db
    .select({ value: count() })
    .from(schema.member)

  console.log(
    `\nDone. ${memberships.length} project memberships seeded.`
  )
  console.log(
    `Verified in database -> users: ${userCount.value}, members: ${memberCount.value}, projects: ${projectCount.value}, tasks: ${taskCount.value}`
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })