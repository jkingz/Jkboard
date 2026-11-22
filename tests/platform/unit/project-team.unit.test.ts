import { describe, expect, it } from "vitest"

import { canOwnProject, projectTeam } from "@/data/jkboard"

/**
 * Owner rules from GLOSSARY.md, issue #14. The actions in
 * `src/db/actions/projects.ts` are server-only and cannot be called here, so
 * these test the two functions every create and update goes through.
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
