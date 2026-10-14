import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { user } from "./auth"
import { project } from "./projects"

/**
 * A workspace membership: the Jkboard-side profile for someone who has an
 * account. Identity (name, email, credentials) stays in the Better Auth
 * `user` table — nothing is duplicated here, only referenced.
 */
export const memberStatusEnum = pgEnum("jkboard_member_status", [
  "active",
  "invited",
  "away",
])

export const member = pgTable(
  "jkboard_member",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Job title shown on the team page, e.g. "Product Lead".
    role: text("role").notNull().default("Member"),
    status: memberStatusEnum("status").notNull().default("invited"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("member_userId_uidx").on(table.userId),
    index("member_status_idx").on(table.status),
  ]
)

/** Many-to-many: who is on which project. */
export const projectMember = pgTable(
  "jkboard_project_member",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => member.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.memberId] }),
    index("project_member_memberId_idx").on(table.memberId),
  ]
)

export type Member = typeof member.$inferSelect
export type NewMember = typeof member.$inferInsert