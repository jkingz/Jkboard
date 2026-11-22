import { describe, expect, it } from "vitest"

import { canOwnProject, projectTeam, removalSuccessor } from "@/data/jkboard"

/**
 * Owner rules from GLOSSARY.md, issues #14 and #16. The actions in
 * `src/db/actions/` are server-only and cannot be called here, so
 * these test the pure rules those actions call.
 */
describe("projectTeam", () => {
  it("adds the Owner when the member list is empty (create with no members)", () => {
    expect(projectTeam("caller", [])).toEqual(["caller"])
  })

  it("keeps the Owner when an update leaves them out", () => {
    expect(projectTeam("owner", ["a", "b"])).toEqual(["owner", "a", "b"])
  })

  it("lists the Owner first, once, with no duplicates", () => {
    expect(projectTeam("owner", ["a", "owner", "a"])).toEqual(["owner", "a"])
  })
})

describe("canOwnProject", () => {
  it("refuses an Invited Member", () => {
    expect(canOwnProject("invited")).toBe(false)
  })

  it("allows Active and Away Members", () => {
    expect(canOwnProject("active")).toBe(true)
    expect(canOwnProject("away")).toBe(true)
  })
})

describe("removalSuccessor", () => {
  it("hands a Removed Member's Projects to the caller", () => {
    expect(removalSuccessor("removed", "caller")).toBe("caller")
  })

  it("refuses self-removal, since nobody would take the Projects", () => {
    expect(() => removalSuccessor("me", "me")).toThrow(/cannot remove yourself/)
  })
})
