import { count, eq } from "drizzle-orm"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

import { schema, testDb } from "./helpers"

/**
 * The first test that writes. It calls `createTaskAction` itself and reads the
 * row back, so it proves the action persists, not only that the schema has the
 * right shape.
 *
 * It writes, so it never touches the working database: it runs only when
 * `TEST_DATABASE_URL` names a scratch Neon branch that differs from
 * `DATABASE_URL`, and skips with that reason otherwise. See tests/README.md.
 *
 * The Next.js runtime is stubbed, not the database: `server-only` is a no-op,
 * `revalidatePath` is a spy, and `requireMembership` returns the Member this
 * suite creates. Everything from the Zod parse to the insert runs for real.
 */

const scratchUrl = process.env.TEST_DATABASE_URL
const available = Boolean(scratchUrl) && scratchUrl !== process.env.DATABASE_URL

const caller = vi.hoisted(() => ({ memberId: "" }))

vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@/db/actions/session", () => ({
  requireMembership: async () => caller.memberId,
}))
vi.mock("@/db", async () => {
  const { testDb } = await import("./helpers")
  return { db: testDb(process.env.TEST_DATABASE_URL) }
})

const { createTaskAction } = await import("@/db/actions/tasks")

describe.skipIf(!available)("createTaskAction against a scratch branch", () => {
  const db = testDb(scratchUrl)
  const suffix = crypto.randomUUID().slice(0, 8)
  let userId = ""
  let projectId = ""

  const taskCount = async () =>
    (await db.select({ value: count() }).from(schema.task).where(eq(schema.task.projectId, projectId)))[0]
      .value

  beforeAll(async () => {
    userId = `usr_test_${suffix}`
    await db.insert(schema.user).values({
      id: userId,
      name: "Write Test",
      email: `write-test-${suffix}@example.test`,
      emailVerified: true,
    })
    const [member] = await db
      .insert(schema.member)
      .values({ userId, role: "Tester", status: "active" })
      .returning({ id: schema.member.id })
    caller.memberId = member.id

    const [project] = await db
      .insert(schema.project)
      .values({
        name: `Write test ${suffix}`,
        key: `WT${suffix.slice(0, 4).toUpperCase()}`,
        description: "",
        status: "active",
        color: "teal",
        ownerId: member.id,
        startDate: "2026-01-01",
        dueDate: "2026-12-31",
      })
      .returning({ id: schema.project.id })
    projectId = project.id
    await db.insert(schema.projectMember).values({ projectId, memberId: member.id })
  })

  afterAll(async () => {
    // Project first: its owner FK is `restrict`. Tasks and team rows cascade.
    if (projectId) await db.delete(schema.project).where(eq(schema.project.id, projectId))
    if (userId) await db.delete(schema.user).where(eq(schema.user.id, userId))
  })

  it("inserts a Task and reads back the same fields", async () => {
    const created = await createTaskAction({
      projectId,
      title: "Written by the integration tier",
      description: "",
      status: "in-progress",
      priority: "high",
      assigneeId: caller.memberId,
      dueDate: "2026-12-01",
    })

    const [row] = await db.select().from(schema.task).where(eq(schema.task.id, created.id))

    expect(row).toMatchObject({
      projectId,
      title: "Written by the integration tier",
      status: "in-progress",
      priority: "high",
      assigneeId: caller.memberId,
      completedAt: null,
    })
    expect(created.dueDate).toBe("2026-12-01")
    expect(created.reference).toBe(row.reference)
  })

  it("rejects an invalid payload and writes nothing", async () => {
    const before = await taskCount()

    await expect(
      createTaskAction({
        projectId,
        title: "",
        status: "todo",
        priority: "low",
        dueDate: "not-a-date",
      } as never)
    ).rejects.toThrow()

    expect(await taskCount()).toBe(before)
  })
})
