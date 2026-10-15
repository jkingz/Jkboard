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
 * which the last test in this file doubles as proof of.
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
  it("is a YYYY-MM-DD string, offset from the local calendar day", () => {
    pin({ zone: "America/Los_Angeles" })

    expect(dateFromToday(0)).toBe("2026-10-15")
    expect(dateFromToday(7)).toBe("2026-10-22")
    expect(dateFromToday(-1)).toBe("2026-10-14")
  })

  it("matches a date-fns walk of the same length", () => {
    pin({ zone: "America/Los_Angeles" })

    const localToday = format(parseISO(dateFromToday(0)), "yyyy-MM-dd")
    expect(dateFromToday(3)).toBe(
      format(addDays(parseISO(localToday), 3), "yyyy-MM-dd")
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

describe("the two clocks in this module", () => {
  /**
   * Known defect, recorded so it stays visible and so fixing it turns this green
   * with an "unexpected pass" rather than silently.
   *
   * `dateFromToday` reads the **local** calendar (`setHours`, `getDate`,
   * `getFullYear`), while `daysUntil` reads the **UTC** calendar. Feed one's
   * output to the other — which is exactly what the task and project forms do,
   * defaulting `dueDate` to `dateFromToday(7)` and the board then calling
   * `isOverdue` — and the answer drifts by the timezone offset whenever the two
   * calendars disagree on the date. In `America/Los_Angeles` after 16:00 local,
   * a task created as "due today" reports -1 and renders overdue on the day it
   * is due.
   *
   * `docs/architecture.md` says the query layer converts to `YYYY-MM-DD` via UTC
   * (`toISODate` in `src/db/queries/jkboard.ts`); this module's private
   * `toISODate` is local. Making the two agree is the fix, and the owner should
   * decide whether form defaults *should* be local — they may well be.
   */
  it.fails("a task due date built with dateFromToday(0) reads as due today", () => {
    pin({ instant: PINNED_INSTANT, zone: "America/Los_Angeles" })

    expect(daysUntil(dateFromToday(0))).toBe(0)
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
