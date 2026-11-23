import { describe, expect, it } from "vitest"

import { seedProjects, seedTaskSeeds } from "../../../scripts/seed-data"
import {
  assertAssigneeOnTeam,
  projects,
  tasks,
  tasksToUnassign,
} from "@/data/jkboard"

/**
 * Assignee rules from GLOSSARY.md, issue #15. The actions in
 * `src/db/actions/` are server-only and cannot be called here, so these test
 * the pure rules `createTaskAction`, `updateTaskAction` and `syncMemberships` call.
 */
describe("assertAssigneeOnTeam", () => {
  it("rejects an Assignee who is not on the Project team, with a readable error", () => {
    expect(() => assertAssigneeOnTeam("outsider", ["owner", "a"])).toThrow(
      /assignee must be on the project team/
    )
  })

  it("allows an Assignee on the team, and no Assignee at all", () => {
    expect(() => assertAssigneeOnTeam("a", ["owner", "a"])).not.toThrow()
    expect(() => assertAssigneeOnTeam(null, ["owner"])).not.toThrow()
    expect(() => assertAssigneeOnTeam(undefined, ["owner"])).not.toThrow()
  })
})

describe("tasksToUnassign", () => {
  it("unassigns the Tasks of a Member who left the team, and only theirs", () => {
    const assigned = [
      { id: "t1", assigneeId: "stays" },
      { id: "t2", assigneeId: "leaves" },
      { id: "t3", assigneeId: null },
      { id: "t4", assigneeId: "leaves" },
    ]
    expect(tasksToUnassign(assigned, ["owner", "stays"])).toEqual(["t2", "t4"])
  })

  it("changes nothing when everyone stays", () => {
    expect(tasksToUnassign([{ id: "t1", assigneeId: "a" }], ["a"])).toEqual([])
  })
})

describe("sample data obeys the rule", () => {
  it("every seed Task's Assignee is on its Project team", () => {
    const team = new Map(seedProjects.map((p) => [p.key, p.memberUserIds]))
    for (const [title, key, , , assigneeUserId] of seedTaskSeeds) {
      expect(team.get(key), title).toContain(assigneeUserId)
    }
  })

  it("every in-memory Task's Assignee is on its Project team", () => {
    const team = new Map(projects.map((p) => [p.id, p.memberIds]))
    for (const task of tasks) {
      expect(team.get(task.projectId), task.title).toContain(task.assigneeId)
    }
  })
})
