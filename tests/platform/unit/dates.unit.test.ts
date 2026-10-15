import { addDays, format, parseISO } from "date-fns"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  dateFromToday,
  daysUntil,
  formatDate,
  formatShortDate,
  getRecentTasks,
  isOverdue,
  type Task,
} from "@/data/jkboard"

/**
 * The date helpers in `src/data/jkboard.ts` decide what "overdue" means on every
 * board, stat card and calendar cell, and they are the second-most-frequent
 * source of bugs in this repo after the router: `daysUntil` already regressed once
 * by measuring against local midnight (`tests/platform/unit/selectors.unit.test.ts`
 * keeps that regression).
 *
 * Time is pinned with fake timers and the zone with `process.env.TZ`, so a result
 * that depends on the wall clock or the machine's locale is a failure rather than
 * a flake. Node honours a mid-process `TZ` change for subsequent `Date` calls,
 * which the tests that re-`pin()` into a second zone double as proof of.
 */

const PINNED_INSTANT = "2026-10-16T01:00:00.000Z"

function pin({ instant = PINNED_INSTANT, zone = "America/Los_Angeles" } = {}) {
  process.env.TZ = zone
  vi.useFakeTimers()
  vi.setSystemTime(new Date(instant))
}

afterEach(() => {
  vi.useRealTimers()
  delete process.env.TZ
})

function task(overrides: Partial<Task> & Pick<Task, "id" | "status">): Task {
  return {
    reference: `TSK-${overrides.id}`,
    title: overrides.id,
    projectId: "p-1",
    assigneeId: "u-1",
    priority: "medium",
    dueDate: "2026-10-16",
    ...overrides,
  }
}

describe("formatDate and formatShortDate", () => {
  it("render a YYYY-MM-DD column value the way the UI labels it", () => {
    expect(formatDate("2026-01-31")).toBe("Jan 31, 2026")
    expect(formatShortDate("2026-01-31")).toBe("Jan 31")
    expect(formatShortDate("2026-10-05")).toBe("Oct 5")
  })

  it("are zone-independent, because a `date` column has no timezone", () => {
    pin({ zone: "Asia/Shanghai" })
    expect(formatDate("2026-03-09")).toBe("Mar 9, 2026")
    pin({ zone: "America/Los_Angeles" })
    expect(formatDate("2026-03-09")).toBe("Mar 9, 2026")
  })

  it("throw on a malformed value instead of rendering Invalid Date", () => {
    // `date` columns are `mode: "string"`, so an empty or padded-wrong value is
    // reachable. Throwing here is the loud half of a contract the UI relies on:
    // no cell ever renders the literal string "Invalid Date".
    expect(() => formatDate("")).toThrow()
    expect(() => formatDate("2026-13-45")).toThrow()
    expect(format(parseISO("2026-10-05"), "MMM d, yyyy")).toBe("Oct 5, 2026")
  })
})

describe("dateFromToday", () => {
  it("is a YYYY-MM-DD string, offset from the UTC calendar day", () => {
    pin({ zone: "America/Los_Angeles" })

    expect(dateFromToday(0)).toBe("2026-10-16")
    expect(dateFromToday(7)).toBe("2026-10-23")
    expect(dateFromToday(-1)).toBe("2026-10-15")
  })

  it("does not move when the local calendar disagrees with UTC", () => {
    // 2026-10-16T01:00Z is still Oct 15 in Los Angeles and already Oct 16 in
    // Shanghai. A `date` column has no zone, so both must produce one value.
    pin({ zone: "Asia/Shanghai" })
    const inShanghai = dateFromToday(0)

    pin({ zone: "America/Los_Angeles" })
    expect(dateFromToday(0)).toBe(inShanghai)
  })

  it("matches a date-fns walk of the same length", () => {
    pin({ zone: "America/Los_Angeles" })

    const today = format(parseISO(dateFromToday(0)), "yyyy-MM-dd")
    expect(dateFromToday(3)).toBe(
      format(addDays(parseISO(today), 3), "yyyy-MM-dd")
    )
  })
})

describe("daysUntil", () => {
  it("counts whole days against UTC midnight", () => {
    pin({ instant: "2026-10-16T23:30:00.000Z", zone: "UTC" })

    expect(daysUntil("2026-10-16")).toBe(0)
    expect(daysUntil("2026-10-19")).toBe(3)
    expect(daysUntil("2026-10-09")).toBe(-7)
  })

  it("does not flip a day when the local calendar is ahead of or behind UTC", () => {
    // 2026-10-16T23:30Z is 2026-10-17 in Shanghai and 2026-10-16 16:30 in LA.
    // `daysUntil` must answer the same way in both, because the stored value has
    // no zone to disagree about.
    const expected = 0

    pin({ instant: "2026-10-16T23:30:00.000Z", zone: "Asia/Shanghai" })
    expect(daysUntil("2026-10-16")).toBe(expected)

    pin({ instant: "2026-10-16T23:30:00.000Z", zone: "America/Los_Angeles" })
    expect(daysUntil("2026-10-16")).toBe(expected)
  })

  it("marks a task overdue only after its due date has passed in UTC", () => {
    pin({ instant: "2026-10-16T01:00:00.000Z", zone: "UTC" })

    expect(isOverdue(task({ id: "1", status: "todo", dueDate: "2026-10-15" }))).toBe(true)
    expect(isOverdue(task({ id: "2", status: "todo", dueDate: "2026-10-16" }))).toBe(false)
  })
})

describe("one calendar between the helpers", () => {
  /**
   * `dateFromToday` and `daysUntil` are the write and read halves of the same
   * `YYYY-MM-DD` value, and the forms feed one directly into the other:
   * `add-task-modal.tsx:67` defaults `dueDate` to `dateFromToday(7)` and the
   * board then calls `isOverdue` on it. This round-trip is what made the old
   * local-vs-UTC split visible — at `2026-10-16T01:00Z` in Los Angeles the write
   * half said Oct 15 while the read half measured from Oct 16, so a task created
   * as "due today" reported -1 and rendered overdue on the day it was due.
   *
   * Both halves now read UTC, so this stays green as an ordinary assertion. The
   * negative offsets are the other half of the contract: a seed that is past its
   * due date must still report past its due date.
   */
  it("round-trips dateFromToday through daysUntil in every zone", () => {
    for (const zone of ["America/Los_Angeles", "Asia/Shanghai", "UTC"]) {
      pin({ instant: PINNED_INSTANT, zone })

      for (const offset of [-96, -9, 0, 6, 7, 21, 30]) {
        expect(daysUntil(dateFromToday(offset))).toBe(offset)
      }
    }
  })
})

describe("getRecentTasks", () => {
  const source = [
    task({ id: "1", status: "completed", dueDate: "2026-10-01" }),
    task({ id: "2", status: "completed", dueDate: "2026-10-20" }),
    task({ id: "3", status: "todo", dueDate: "2026-10-30" }),
    task({ id: "4", status: "completed", dueDate: "2026-10-10" }),
  ]

  it("returns only completed work, newest due date first, honouring the limit", () => {
    expect(getRecentTasks(3, source).map((t) => t.id)).toEqual(["2", "4", "1"])
    expect(getRecentTasks(1, source).map((t) => t.id)).toEqual(["2"])
  })

  it("leaves the source array in place", () => {
    const before = source.map((t) => t.id)
    getRecentTasks(4, source)
    expect(source.map((t) => t.id)).toEqual(before)
  })

  it("defaults the limit to six", () => {
    const many = Array.from({ length: 9 }, (_, index) =>
      task({
        id: String(index),
        status: "completed",
        dueDate: `2026-10-${String(index + 1).padStart(2, "0")}`,
      })
    )

    expect(getRecentTasks(undefined, many)).toHaveLength(6)
  })
})
