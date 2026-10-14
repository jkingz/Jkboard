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
  it("every FlowBoard table is namespaced under jkboard_", async () => {
    const tables = rowsOf<{ table_name: string }>(
      await db!.execute(
        sql`select table_name from information_schema.tables
            where table_schema = 'public' and table_type = 'BASE TABLE'
            order by table_name`
      )
    ).map((t) => t.table_name)

    for (const table of tables) {
      expect(table).toMatch(/^jkboard_/)
    }

    // The eight tables the schema declares.
    expect(tables).toEqual(
      expect.arrayContaining([
        "jkboard_user",
        "jkboard_session",
        "jkboard_account",
        "jkboard_verification",
        "jkboard_member",
        "jkboard_project",
        "jkboard_project_member",
        "jkboard_task",
      ])
    )
  })

  it("invariant 2: jkboard_member carries no identity columns", async () => {
    const names = await columnNames("jkboard_member")

    // Identity lives in jkboard_user; member holds membership only.
    expect(names).not.toContain("email")
    expect(names).not.toContain("name")
    expect(names).not.toContain("image")
    expect(names).toContain("user_id")
    expect(names).toContain("role")
  })

  it("invariant 2: jkboard_user is where identity actually lives", async () => {
    const names = await columnNames("jkboard_user")

    expect(names).toContain("email")
    expect(names).toContain("name")
    // snake_case columns, per casing: "snake_case" in both Drizzle configs.
    expect(names).toContain("email_verified")
    expect(names).toContain("created_at")
    expect(names).not.toContain("emailVerified")
  })

  it("invariant 3: jkboard_task.reference is database-generated and unique", async () => {
    const reference = rowsOf<{
      column_default: string
      is_nullable: string
    }>(
      await db!.execute(
        sql`select column_default, is_nullable
            from information_schema.columns
            where table_schema = 'public' and table_name = 'jkboard_task'
              and column_name = 'reference'`
      )
    )[0]

    expect(reference).toBeDefined()
    // The client never supplies it — the database fills it in.
    expect(reference!.column_default).toContain("nextval")
    expect(reference!.column_default).toContain("jkboard_task_reference_seq")

    const indexes = rowsOf<{ indexdef: string }>(
      await db!.execute(
        sql`select indexdef from pg_indexes
            where schemaname = 'public' and tablename = 'jkboard_task'`
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
      sql`select 1 from pg_class where relname = 'jkboard_task_reference_seq'`
    )
    expect(rowsOf(seq)).toHaveLength(1)
  })

  it("the delete behaviours are asymmetric: owner RESTRICT, assignee SET NULL", async () => {
    expect(await deleteRuleFor("jkboard_project", "owner_id")).toBe("RESTRICT")
    expect(await deleteRuleFor("jkboard_task", "assignee_id")).toBe("SET NULL")
  })

  it("jkboard_task.project_id cascades when a project is deleted", async () => {
    expect(await deleteRuleFor("jkboard_task", "project_id")).toBe("CASCADE")
  })

  it("the enums are namespaced too", async () => {
    const enums = rowsOf<{ typname: string }>(
      await db!.execute(
        sql`select typname from pg_type
            where typname like 'jkboard%' and typtype = 'e'`
      )
    ).map((e) => e.typname)

    expect(enums).toEqual(
      expect.arrayContaining([
        "jkboard_member_status",
        "jkboard_project_status",
        "jkboard_task_status",
        "jkboard_task_priority",
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