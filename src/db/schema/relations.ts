import { relations } from "drizzle-orm"

import { account, session, user, verification } from "./auth"
import { member, projectMember } from "./members"
import { project } from "./projects"
import { task } from "./tasks"

/* ------------------------------- Better Auth ------------------------------ */

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  memberships: many(member),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}))

/* -------------------------------- FlowBoard ------------------------------- */

export const memberRelations = relations(member, ({ one, many }) => ({
  user: one(user, { fields: [member.userId], references: [user.id] }),
  ownedProjects: many(project),
  projectMemberships: many(projectMember),
  assignedTasks: many(task),
}))

export const projectRelations = relations(project, ({ one, many }) => ({
  owner: one(member, { fields: [project.ownerId], references: [member.id] }),
  members: many(projectMember),
  tasks: many(task),
}))

export const projectMemberRelations = relations(projectMember, ({ one }) => ({
  project: one(project, {
    fields: [projectMember.projectId],
    references: [project.id],
  }),
  member: one(member, {
    fields: [projectMember.memberId],
    references: [member.id],
  }),
}))

export const taskRelations = relations(task, ({ one }) => ({
  project: one(project, {
    fields: [task.projectId],
    references: [project.id],
  }),
  assignee: one(member, {
    fields: [task.assigneeId],
    references: [member.id],
  }),
}))

export type { user, session, account, verification }
export { user as userTable, session as sessionTable, account as accountTable, verification as verificationTable }