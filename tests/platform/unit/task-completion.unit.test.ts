import { describe, expect, it } from "vitest"

import { completedAtFor } from "@/data/jkboard"

/**
 * Completed from GLOSSARY.md, issue #17. `updateTaskAction` is server-only, so
 * this tests the rule it applies to every update.
 */
const now = new Date("2026-11-23T10:00:00Z")

describe("completedAtFor", () => {
  it("keeps the date when an already Completed Task is saved as Completed", () => {
    expect(completedAtFor("completed", "completed", now)).toBeUndefined()
  })

  it("keeps the date when the update carries no status", () => {
    expect(completedAtFor("completed", undefined, now)).toBeUndefined()
  })

  it("sets the date when a Task enters Completed", () => {
    expect(completedAtFor("in-review", "completed", now)).toBe(now)
  })

  it("clears the date when a Task leaves Completed for any status", () => {
    for (const next of ["todo", "in-progress", "in-review"] as const) {
      expect(completedAtFor("completed", next, now)).toBeNull()
    }
  })
})
