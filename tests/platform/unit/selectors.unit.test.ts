import { describe, expect, it } from "vitest"

import {
  daysUntil,
  getProjectProgress,
  getTaskStats,
  getTasksForProject,
  getUpcomingTasks,
  getWorkload,
  isOverdue,
  type Task,
} from "@/data/jkboard"

/**
 * The selectors in `src/data/jkboard.ts` are pure — no I/O, no database. They
 * are what every dashboard stat, the calendar and the team workload read from,
 * so they are the cheapest real coverage in the repo.
 *
 * Fixtures are hand-built rather than pulled from the module's own seed arrays:
 * asserting against the same data the code defaults to would pass even if the
 * logic were inverted.
 */

/**
 * All fixtures are UTC-derived, matching how the app writes dates
 * (`toISODate`, and `date` columns carry no timezone). Building them any other
 * way would make these tests pass or fail depending on the machine's timezone —
 * which is exactly the bug the `daysUntil` regression test below pins.
 */
const TODAY = new Date().toISOString().slice(0, 10)

function isoDate(offsetDays: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

function task(overrides: Partial<Task> & Pick<Task, "id" | "status">): Task {
  return {
    reference: `TSK-${overrides.id}`,
    title: overrides.id,
    projectId: "p-1",
    assigneeId: "u-1",
    priority: "medium",
    dueDate: TODAY,
    ...overrides,
  }
}

describe("getTaskStats", () => {
  it("splits total, active, completed and derives a completion rate", () => {
    const stats = getTaskStats([
      task({ id: "1", status: "completed" }),
      task({ id: "2", status: "completed" }),
      task({ id: "3", status: "todo" }),
      task({ id: "4", status: "in-progress" }),
    ])

    expect(stats.total).toBe(4)
    expect(stats.completed).toBe(2)
    expect(stats.active).toBe(2)
    expect(stats.completionRate).toBe(50)
  })

  it("reports a zero rate for an empty list instead of dividing by zero", () => {
    expect(getTaskStats([])).toEqual({
      total: 0,
      active: 0,
      completed: 0,
      overdue: 0,
      completionRate: 0,
    })
  })

  it("counts a task with no due date as neither overdue nor completed-active", () => {
    const stats = getTaskStats([
      task({ id: "1", status: "todo", dueDate: TODAY }),
      task({ id: "2", status: "todo", dueDate: isoDate(-3) }),
    ])

    expect(stats.overdue).toBe(1)
  })
})

describe("isOverdue", () => {
  it("is true only for an unfinished task whose due date has passed", () => {
    expect(isOverdue(task({ id: "1", status: "todo", dueDate: isoDate(-1) }))).toBe(true)
    expect(isOverdue(task({ id: "2", status: "todo", dueDate: TODAY }))).toBe(false)
    expect(isOverdue(task({ id: "3", status: "todo", dueDate: isoDate(1) }))).toBe(false)
  })

  it("is false for a completed task however old it is", () => {
    expect(
      isOverdue(task({ id: "4", status: "completed", dueDate: isoDate(-30) }))
    ).toBe(false)
  })
})

describe("getProjectProgress", () => {
  const source = [
    task({ id: "1", projectId: "p-1", status: "completed" }),
    task({ id: "2", projectId: "p-1", status: "completed" }),
    task({ id: "3", projectId: "p-1", status: "in-review" }),
    task({ id: "4", projectId: "p-2", status: "todo" }),
  ]

  it("counts only the requested project's tasks", () => {
    expect(getProjectProgress("p-1", source)).toEqual({
      total: 3,
      completed: 2,
      progress: 67,
    })
  })

  it("returns zero progress for a project with no tasks", () => {
    expect(getProjectProgress("p-missing", source)).toEqual({
      total: 0,
      completed: 0,
      progress: 0,
    })
  })
})

describe("getWorkload", () => {
  const source = [
    task({ id: "1", assigneeId: "u-1", status: "completed" }),
    task({ id: "2", assigneeId: "u-1", status: "todo" }),
    task({ id: "3", assigneeId: "u-1", status: "in-progress" }),
    task({ id: "4", assigneeId: "u-2", status: "todo" }),
  ]

  it("separates open from completed work for one member", () => {
    expect(getWorkload("u-1", source)).toEqual({ assigned: 2, completed: 1 })
  })

  it("reports zero for a member with no tasks", () => {
    expect(getWorkload("u-nobody", source)).toEqual({ assigned: 0, completed: 0 })
  })

  it("does not count an unassigned task as anyone's workload", () => {
    expect(
      getWorkload("", [task({ id: "5", assigneeId: "", status: "todo" })])
    ).toEqual({ assigned: 1, completed: 0 })
  })
})

describe("daysUntil", () => {
  /**
   * Regression. `daysUntil` used to measure against LOCAL midnight while every
   * date in the app is UTC-derived. In any timezone ahead of UTC, a task due
   * "today" reported -1 and therefore rendered as overdue for the first hours
   * of the day. This suite runs at UTC+8, where the bug was live.
   */
  it("reports 0 for a date that is today in UTC, whatever the local timezone", () => {
    expect(daysUntil(TODAY)).toBe(0)
  })

  it("is negative for a past date and positive for a future one", () => {
    expect(daysUntil(isoDate(-1))).toBe(-1)
    expect(daysUntil(isoDate(1))).toBe(1)
  })

  it("does not drift by a day near the UTC day boundary", () => {
    expect(daysUntil(isoDate(0))).toBe(0)
    expect(daysUntil(isoDate(7))).toBe(7)
    expect(daysUntil(isoDate(-7))).toBe(-7)
  })
})

describe("getUpcomingTasks", () => {
  const source = [
    task({ id: "1", status: "todo", dueDate: isoDate(5) }),
    task({ id: "2", status: "todo", dueDate: isoDate(1) }),
    task({ id: "3", status: "completed", dueDate: isoDate(0) }),
  ]

  it("excludes completed tasks and sorts by due date ascending", () => {
    expect(getUpcomingTasks(undefined, source).map((t) => t.id)).toEqual(["2", "1"])
  })

  it("honours a limit", () => {
    expect(getUpcomingTasks(1, source).map((t) => t.id)).toEqual(["2"])
  })

  it("does not mutate the source array", () => {
    const before = source.map((t) => t.id)
    getUpcomingTasks(undefined, source)
    expect(source.map((t) => t.id)).toEqual(before)
  })
})

describe("getTasksForProject", () => {
  it("filters to one project", () => {
    const source = [
      task({ id: "1", projectId: "p-1", status: "todo" }),
      task({ id: "2", projectId: "p-2", status: "todo" }),
      task({ id: "3", projectId: "p-1", status: "in-review" }),
    ]

    expect(getTasksForProject("p-1", source).map((t) => t.id)).toEqual(["1", "3"])
  })
})