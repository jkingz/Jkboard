import {
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { member } from "./members"

export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "active",
  "on-hold",
  "completed",
])

export const project = pgTable(
  "project",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    /** Short uppercase key used in the UI, e.g. "MOB". */
    key: text("key").notNull(),
    description: text("description").notNull().default(""),
    status: projectStatusEnum("status").notNull().default("planning"),
    /** CSS colour token, e.g. "var(--chart-1)". */
    color: text("color").notNull().default("var(--chart-1)"),
    /** Membership row that owns the project. */
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => member.id, { onDelete: "restrict" }),
    startDate: date("start_date", { mode: "string" }).notNull(),
    dueDate: date("due_date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("project_key_uidx").on(table.key),
    index("project_status_idx").on(table.status),
    index("project_ownerId_idx").on(table.ownerId),
    // The projects page and calendar both sort by upcoming due date.
    index("project_dueDate_idx").on(table.dueDate),
  ]
)

export type Project = typeof project.$inferSelect
export type NewProject = typeof project.$inferInsert