import { sql } from "drizzle-orm"
import { describe, expect, it } from "vitest"

import {
  memberStatusSchema,
  projectStatusSchema,
  taskPrioritySchema,
  taskStatusSchema,
} from "@/data/jkboard"

import { hasDatabase, rowsOf, skipReason, testDb } from "./helpers"

/**
 * Column contracts: the defaults, enum spellings and indexes that
 * `docs/architecture.md` describes in prose and that nothing checked.
 *
 * Each of these is a failure that surfaces as *behaviour*, not as an error:
 *
 * - a dropped default means `createTaskAction` inserts `status = null` and the
 *   board loses the card;
 * - a renamed enum label means a filter matches nothing;
 * - a dropped index means the tasks page and the calendar stop being served by
 *   `task_projectid_status_idx` and start scanning.
 *
 * Read-only throughout, like the invariants suite: this database is the shared
 * demo workspace, so it asserts against `information_schema` and `pg_indexes`
 * and inserts nothing. Writing is `docs/target-state.md` → "Behavioural tests
 * for the server actions", which needs a disposable database first.
 */

const available = hasDatabase()
const db = available ? testDb() : null

const columnsOf = async (table: string) =>
  rowsOf<{ column_name: string; column_default: string | null; is_nullable: string }>(
    await db!.execute(
      sql`select column_name, column_default, is_nullable
          from information_schema.columns
          where table_schema = 'public' and table_name = ${table}`
    )
  )

const enumLabels = async (name: string) =>
  rowsOf<{ label: string }>(
    await db!.execute(
      sql`select e.enumlabel as label
          from pg_type t
          join pg_enum e on e.enumtypid = t.oid
          where t.typname = ${name}
          order by e.enumsortorder`
    )
  ).map((r) => r.label)

const indexesOf = async (table: string) =>
  rowsOf<{ indexname: string; indexdef: string }>(
    await db!.execute(
      sql`select indexname, indexdef from pg_indexes
          where schemaname = 'public' and tablename = ${table}`
    )
  )

/** The default the ORM declares, as it actually lands in the catalogue. */
const EXPECTED_DEFAULTS: Array<[string, string, string]> = [
  ["task", "status", "'todo'"],
  ["task", "priority", "'medium'"],
  ["task", "description", "''"],
  ["task", "position", "0"],
  ["project", "status", "'planning'"],
  ["project", "description", "''"],
  ["project", "color", "'var(--chart-1)'"],
  ["member", "role", "'Member'"],
  ["member", "status", "'invited'"],
]

describe.skipIf(!available)("column contracts", () => {
  it("every declared default is present in the catalogue", async () => {
    const byTable = new Map<string, Map<string, string | null>>()

    for (const table of ["task", "project", "member"]) {
      byTable.set(
        table,
        new Map((await columnsOf(table)).map((c) => [c.column_name, c.column_default]))
      )
    }

    for (const [table, column, expected] of EXPECTED_DEFAULTS) {
      const actual = byTable.get(table)?.get(column) ?? null
      expect(actual, `${table}.${column}`).toContain(expected)
    }
  })

  it("id, created_at and updated_at fill themselves in", async () => {
    for (const [table, column] of [
      ["task", "id"],
      ["project", "id"],
      ["member", "id"],
      ["task", "created_at"],
      ["project", "created_at"],
      ["task", "updated_at"],
    ]) {
      const column_ = (await columnsOf(table)).find((c) => c.column_name === column)
      expect(column_?.column_default, `${table}.${column}`).toBeTruthy()
      expect(column_?.is_nullable, `${table}.${column}`).toBe("NO")
    }
  })

  it("the task and project status enums hold exactly what the view model offers", async () => {
    // The kanban columns, the filters and the badges are all driven by the Zod
    // enums in `src/data/jkboard.ts`; the database is allowed to know nothing
    // extra, or a row appears on no column and in no filter.
    expect(await enumLabels("task_status")).toEqual(taskStatusSchema.options)
    expect(await enumLabels("project_status")).toEqual(projectStatusSchema.options)
  })

  it("priority matches as a set, because the two orders are different on purpose", async () => {
    // Declared least-to-most urgent in `src/db/schema/tasks.ts`, most-to-least in
    // the view model, and the board displays the catalogue order.
    expect(new Set(await enumLabels("task_priority"))).toEqual(new Set(taskPrioritySchema.options))
  })

  it("member status is lowercase in the database and capitalised in the view model", async () => {
    // The translation happens inside `getWorkspaceData`, which is `server-only`
    // and unreachable from a test process. Pinning both halves here means the
    // mapping cannot be changed on one side only.
    const stored = await enumLabels("member_status")

    expect(stored).toEqual(["active", "invited", "away"])
    expect(stored).toEqual(memberStatusSchema.options.map((v) => v.toLowerCase()))
  })

  it("the indexes the read paths depend on exist, on the columns they claim", async () => {
    // Names are the quoted identifiers `src/db/schema/*.ts` declares, so they
    // keep their camelCase in the catalogue — verified against `pg_indexes`.
    const expected: Array<[string, string, string[]]> = [
      ["task", "task_projectId_idx", ["project_id"]],
      ["task", "task_status_idx", ["status"]],
      ["task", "task_dueDate_idx", ["due_date"]],
      ["task", "task_assigneeId_idx", ["assignee_id"]],
      ["task", "task_projectId_status_idx", ["project_id", "status"]],
      ["task", "task_reference_uidx", ["reference"]],
      ["project", "project_key_uidx", ["key"]],
      ["project", "project_status_idx", ["status"]],
      ["project", "project_ownerId_idx", ["owner_id"]],
      ["project", "project_dueDate_idx", ["due_date"]],
      ["member", "member_userId_uidx", ["user_id"]],
      ["member", "member_status_idx", ["status"]],
      ["project_member", "project_member_memberId_idx", ["member_id"]],
      // Better Auth looks a session up by token and refuses duplicate addresses.
      ["session", "session_token_unique", ["token"]],
      ["user", "user_email_unique", ["email"]],
    ]

    const catalogues = new Map<string, Array<{ indexname: string; indexdef: string }>>()
    for (const table of ["task", "project", "member", "project_member", "session", "user"]) {
      catalogues.set(table, await indexesOf(table))
    }

    for (const [table, indexName, columns] of expected) {
      const found = catalogues.get(table)?.find((i) => i.indexname === indexName)
      expect(found, `${table}: ${indexName} is missing`).toBeDefined()

      // Every column of the composite has to appear, in order, in the definition.
      const definition = found!.indexdef
      let cursor = 0
      for (const column of columns) {
        const at = definition.indexOf(column, cursor)
        expect(at, `${indexName} should key on ${column}`).toBeGreaterThan(-1)
        cursor = at
      }

      if (indexName.endsWith("_uidx")) expect(definition).toContain("UNIQUE")
    }
  })

  it("project_member is a bare join table: composite key, no surrogate id", async () => {
    const columns = (await columnsOf("project_member")).map((c) => c.column_name)
    expect(columns).not.toContain("id")
    expect(columns.sort()).toEqual(["member_id", "project_id"])

    const pk = rowsOf<{ column_name: string }>(
      await db!.execute(
        sql`select kcu.column_name
            from information_schema.table_constraints tc
            join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name
            where tc.constraint_type = 'PRIMARY KEY'
              and tc.table_schema = 'public' and tc.table_name = 'project_member'
            order by kcu.ordinal_position`
      )
    ).map((r) => r.column_name)

    expect(pk).toEqual(["project_id", "member_id"])
  })

  it("the columns every action supplies are NOT NULL, so a missing field is a hard failure", async () => {
    const required: Array<[string, string]> = [
      ["task", "title"],
      ["task", "project_id"],
      ["task", "due_date"],
      ["project", "name"],
      ["project", "key"],
      ["project", "owner_id"],
      ["project", "start_date"],
      ["project", "due_date"],
      ["member", "user_id"],
    ]

    const byTable = new Map<string, Map<string, string>>()
    for (const table of ["task", "project", "member"]) {
      byTable.set(table, new Map((await columnsOf(table)).map((c) => [c.column_name, c.is_nullable])))
    }

    for (const [table, column] of required) {
      expect(byTable.get(table)?.get(column), `${table}.${column}`).toBe("NO")
    }

    // …and the two that are deliberately nullable.
    expect((await columnsOf("task")).find((c) => c.column_name === "assignee_id")!.is_nullable).toBe(
      "YES"
    )
    expect((await columnsOf("task")).find((c) => c.column_name === "completed_at")!.is_nullable).toBe(
      "YES"
    )
  })
})

/**
 * The gaps this tier cannot close, recorded where a future reader will trip over
 * them. Vitest reports these as todos, so they show up in the run rather than
 * only in `docs/target-state.md`.
 */
describe("not yet covered", () => {
  it.todo("createTaskAction writes a row that getWorkspaceData reads back")
  it.todo("a payload that fails the action's Zod schema is rejected, not coerced")
  it.todo("an action called without a session is refused — docs/architecture.md: no action checks")
  it.todo("the demo account cannot delete a project or invite a member")
  it.todo("getMemberId returns the caller's membership, not members[0], for a second user")
})

describe.skipIf(available)("integration tier", () => {
  it(`SKIPPED — ${skipReason() === "unknown" ? "no database" : skipReason()}`, () => {
    expect(available).toBe(false)
  })
})
