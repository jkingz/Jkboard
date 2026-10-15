import { describe, expect, it } from "vitest"

import {
  getProjectStatus,
  getTaskStatus,
  memberStatusSchema,
  members,
  priorityClasses,
  priorityIcons,
  projectColorOptions,
  projectProgressSeries,
  projectStatusClasses,
  projectStatusSchema,
  projectStatuses,
  projectSchema,
  projects,
  taskPriorities,
  taskPrioritySchema,
  taskSchema,
  taskStatusSchema,
  taskStatuses,
  tasks,
  teamWorkload,
} from "@/data/jkboard"

/**
 * The view model is the contract between the database and every badge, filter
 * and chart in the UI. `docs/architecture.md` describes each half of it in prose
 * — the enums, the "written but never read" `task.description`, the swatch list
 * that must contain the column default — and none of it was checked.
 *
 * These tests fail when the halves drift apart, which is the failure mode that
 * actually happens: someone adds a status to the database enum and the board
 * then renders an unstyled badge or throws on `getTaskStatus(...).label`.
 */

const valuesOf = (catalogue: Array<{ value: string }>) => catalogue.map((e) => e.value)

describe("status and priority enums line up with the option catalogues", () => {
  it("projectStatuses covers projectStatusSchema exactly, in order", () => {
    expect(valuesOf(projectStatuses)).toEqual(projectStatusSchema.options)
  })

  it("taskStatuses covers taskStatusSchema exactly, in order", () => {
    expect(valuesOf(taskStatuses)).toEqual(taskStatusSchema.options)
  })

  it("taskPriorities covers taskPrioritySchema, as a set", () => {
    // Deliberately not an order check: the catalogue is display-ordered
    // most-urgent first, the enum is declared least-to-most. A new priority still
    // has to appear in both.
    expect(new Set(valuesOf(taskPriorities))).toEqual(new Set(taskPrioritySchema.options))
    expect(taskPriorities[0].value).toBe("urgent")
  })

  it("every enum value has a class pair and an icon, so nothing renders unstyled", () => {
    expect(Object.keys(priorityClasses).sort()).toEqual([...taskPrioritySchema.options].sort())
    expect(Object.keys(priorityIcons).sort()).toEqual([...taskPrioritySchema.options].sort())
    expect(Object.keys(projectStatusClasses).sort()).toEqual(
      [...projectStatusSchema.options].sort()
    )

    for (const status of projectStatuses) {
      expect(projectStatusClasses[status.value], status.value).toMatch(/bg-/)
    }
  })

  it("the lookups resolve every value and label it claims to", () => {
    for (const value of taskStatusSchema.options) {
      const found = getTaskStatus(value)
      expect(found.value).toBe(value)
      expect(found.label.length).toBeGreaterThan(0)
      expect(found.icon).toBeTruthy()
    }
    for (const value of projectStatusSchema.options) {
      expect(getProjectStatus(value).value).toBe(value)
    }
  })

  it("labels are unique within a catalogue, so a filter list cannot show two of one", () => {
    for (const catalogue of [projectStatuses, taskStatuses, taskPriorities]) {
      const labels = valuesOf(catalogue)
      expect(new Set(labels).size).toBe(labels.length)
    }
  })
})

describe("the view model drops what the UI never reads", () => {
  it("taskSchema has no description field, and strips one that is supplied", () => {
    // Invariant of the storage model: `task.description` is written by the
    // actions and selected nowhere, so it must not leak into the client store.
    expect(Object.keys(taskSchema.shape)).not.toContain("description")

    const parsed = taskSchema.parse({
      id: "t-1",
      reference: "TSK-0001",
      title: "Wire the board",
      projectId: "p-1",
      status: "todo",
      priority: "medium",
      assigneeId: "m-1",
      dueDate: "2026-10-20",
      description: "should not survive the boundary",
    })

    expect(Object.keys(parsed)).not.toContain("description")
  })

  it("projectSchema keeps description, because the grid and the board render it", () => {
    expect(Object.keys(projectSchema.shape)).toContain("description")
  })

  it("the member status is the capitalised view-model spelling", () => {
    // The database enum is lowercase (`invited`, `active`, `away`); the
    // translation happens in `getWorkspaceData`, which is `server-only` and
    // therefore unreachable from this tier. Pinned here so the two spellings
    // cannot be quietly unified in one place only.
    expect(memberStatusSchema.options).toEqual(["Active", "Invited", "Away"])
  })

  it("rejects a task whose status is not one of the four", () => {
    const base = {
      id: "t-1",
      reference: "TSK-0001",
      title: "x",
      projectId: "p-1",
      priority: "medium",
      assigneeId: "m-1",
      dueDate: "2026-10-20",
    }

    expect(taskSchema.safeParse({ ...base, status: "blocked" }).success).toBe(false)
    expect(taskSchema.safeParse({ ...base, status: "todo" }).success).toBe(true)
    expect(taskSchema.safeParse({ ...base, status: "todo", priority: "critical" }).success).toBe(
      false
    )
  })
})

describe("project colour options and the derived chart series", () => {
  it("every swatch is a CSS variable reference, not a literal colour", () => {
    for (const option of projectColorOptions) {
      expect(option.value).toMatch(/^var\(--chart-\d\)$/)
      expect(option.label.length).toBeGreaterThan(0)
    }

    // `project.color` defaults to 'var(--chart-1)' in the database
    // (docs/architecture.md → Persistence schema), so the default must be an
    // option the form can actually offer.
    expect(projectColorOptions.map((o) => o.value)).toContain("var(--chart-1)")
  })

  it("the derived series have one row per seed project and per seed member", () => {
    // Reading the seed arrays is legal here and nowhere else in `src/` except the
    // marketing preview — see the boundary test. The arrays are what these two
    // exports are built from, so they are the only honest reference.
    expect(projectProgressSeries.map((row) => row.project)).toEqual(projects.map((p) => p.key))

    for (const [index, project] of projects.entries()) {
      const row = projectProgressSeries[index]
      expect(row.name).toBe(project.name)
      expect(row.color).toBe(project.color)
      expect(row.tasks).toBe(tasks.filter((t) => t.projectId === project.id).length)

      const completed = tasks.filter(
        (t) => t.projectId === project.id && t.status === "completed"
      ).length
      expect(row.progress).toBe(
        row.tasks ? Math.round((completed / row.tasks) * 100) : 0
      )
    }

    expect(teamWorkload.map((row) => row.member)).toEqual(members.map((m) => m.name))
    for (const [index, member] of members.entries()) {
      const row = teamWorkload[index]
      expect(row.initials).toBe(member.initials)
      expect(row.assigned).toBe(
        tasks.filter((t) => t.assigneeId === member.id && t.status !== "completed").length
      )
      expect(row.completed).toBe(
        tasks.filter((t) => t.assigneeId === member.id && t.status === "completed").length
      )
    }
  })
})
