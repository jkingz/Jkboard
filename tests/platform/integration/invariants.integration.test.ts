import { sql } from "drizzle-orm"
import { describe, expect, it } from "vitest"

import { hasDatabase, rowsOf, skipReason, testDb } from "./helpers"

/**
 * Invariants 2, 3 and 6 from `docs/architecture.md`, verified against a real
 * Postgres. These were the three the docs called "the first candidates" because
 * they are testable with a database and no browser.
 *
 * Credential-gated. Without a real `DATABASE_URL` the suite skips with a stated
 * reason rather than passing silently — an empty tier that exits 0 is
 * indistinguishable from coverage.
 *
 * These assert on `information_schema` rather than inserting rows. The schema is
 * the contract under test here, and reading it never mutates the database.
 */

const available = hasDatabase()
const db = available ? testDb() : null

const columnNames = async (table: string) =>
  rowsOf<{ column_name: string }>(
    await db!.execute(
      sql`select column_name from information_schema.columns
          where table_schema = 'public' and table_name = ${table}
          order by ordinal_position`
    )
  ).map((c) => c.column_name)

const deleteRuleFor = async (table: string, column: string) =>
  rowsOf<{ delete_rule: string }>(
    await db!.execute(
      sql`select rc.delete_rule
          from information_schema.table_constraints tc
          join information_schema.key_column_usage kcu
            on tc.constraint_name = kcu.constraint_name
          join information_schema.referential_constraints rc
            on tc.constraint_name = rc.constraint_name
          where tc.constraint_type = 'FOREIGN KEY'
            and tc.table_schema = 'public'
            and tc.table_name = ${table}
            and kcu.column_name = ${column}`
    )
  )[0]?.delete_rule

describe.skipIf(!available)("persistence invariants", () => {
  it("the eight declared tables exist in public", async () => {
    const tables = rowsOf<{ table_name: string }>(
      await db!.execute(
        sql`select table_name from information_schema.tables
            where table_schema = 'public' and table_type = 'BASE TABLE'
            order by table_name`
      )
    ).map((t) => t.table_name)

    expect(tables).toEqual(
      expect.arrayContaining([
        "user",
        "session",
        "account",
        "verification",
        "member",
        "project",
        "project_member",
        "task",
      ])
    )
  })

  it("invariant 2: member carries no identity columns", async () => {
    const names = await columnNames("member")

    // Identity lives in user; member holds membership only.
    expect(names).not.toContain("email")
    expect(names).not.toContain("name")
    expect(names).not.toContain("image")
    expect(names).toContain("user_id")
    expect(names).toContain("role")
  })

  it("the app's user table is in public, and neon_auth.user is left alone", async () => {
    // This database also hosts Neon's built-in Auth, which has its own
    // `neon_auth.user`. Both exist and both must: the app's tables are in
    // public, and nothing here may drop or alter anything under neon_auth.
    const schemas = rowsOf<{ table_schema: string }>(
      await db!.execute(
        sql`select table_schema from information_schema.tables
            where table_name = 'user' and table_type = 'BASE TABLE'`
      )
    ).map((t) => t.table_schema)

    expect(schemas).toContain("public")
    // neon_auth.user still being there is the point — it is untouched.
    expect(schemas).toContain("neon_auth")

    // The app's user table is the snake_case Drizzle one, not the auth shape.
    const appColumns = await columnNames("user")
    expect(appColumns).toContain("email_verified")
    expect(appColumns).not.toContain("banned")
  })

  it("invariant 2: user is where identity actually lives", async () => {
    const names = await columnNames("user")

    expect(names).toContain("email")
    expect(names).toContain("name")
    // snake_case columns, per casing: "snake_case" in both Drizzle configs.
    expect(names).toContain("email_verified")
    expect(names).toContain("created_at")
    expect(names).not.toContain("emailVerified")
  })

  it("invariant 3: task.reference is database-generated and unique", async () => {
    const reference = rowsOf<{
      column_default: string
      is_nullable: string
    }>(
      await db!.execute(
        sql`select column_default, is_nullable
            from information_schema.columns
            where table_schema = 'public' and table_name = 'task'
              and column_name = 'reference'`
      )
    )[0]

    expect(reference).toBeDefined()
    // The client never supplies it — the database fills it in.
    expect(reference!.column_default).toContain("nextval")
    expect(reference!.column_default).toContain("task_reference_seq")

    const indexes = rowsOf<{ indexdef: string }>(
      await db!.execute(
        sql`select indexdef from pg_indexes
            where schemaname = 'public' and tablename = 'task'`
      )
    )

    const uniqueOnReference = indexes.some(
      (i) => i.indexdef.includes("reference") && i.indexdef.includes("UNIQUE")
    )
    expect(uniqueOnReference).toBe(true)
  })

  it("the reference sequence exists, so the default cannot fail at insert", async () => {
    // The generated migration declares the DEFAULT but never emits CREATE
    // SEQUENCE. Without this, the first task insert fails at runtime.
    const seq = await db!.execute(
      sql`select 1 from pg_class where relname = 'task_reference_seq'`
    )
    expect(rowsOf(seq)).toHaveLength(1)
  })

  it("the delete behaviours are asymmetric: owner RESTRICT, assignee SET NULL", async () => {
    expect(await deleteRuleFor("project", "owner_id")).toBe("RESTRICT")
    expect(await deleteRuleFor("task", "assignee_id")).toBe("SET NULL")
  })

  it("task.project_id cascades when a project is deleted", async () => {
    expect(await deleteRuleFor("task", "project_id")).toBe("CASCADE")
  })

  it("the four status and priority enums exist", async () => {
    const enums = rowsOf<{ typname: string }>(
      await db!.execute(
        sql`select typname from pg_type
            where typname in ('member_status','project_status','task_status','task_priority') and typtype = 'e'`
      )
    ).map((e) => e.typname)

    expect(enums).toEqual(
      expect.arrayContaining([
        "member_status",
        "project_status",
        "task_status",
        "task_priority",
      ])
    )
  })
})

describe.skipIf(available)("integration tier", () => {
  it(`SKIPPED — ${skipReason() === "unknown" ? "no database" : skipReason()}`, () => {
    // Present so a skipped run is visible in the report rather than an empty tier.
    expect(available).toBe(false)
  })
})