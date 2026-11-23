import { describe, expect, it } from "vitest"

import { nonSeededEmails, seedMembers } from "../../../scripts/seed-data"

const seeded = seedMembers.map((entry) => entry.email)

describe("nonSeededEmails — what db:seed would destroy that it did not create", () => {
  it("is empty when only seeded users exist", () => {
    expect(nonSeededEmails(seeded)).toEqual([])
    expect(nonSeededEmails([])).toEqual([])
  })

  it("names a real user who signed up", () => {
    expect(nonSeededEmails([...seeded, "real.person@example.com"])).toEqual([
      "real.person@example.com",
    ])
  })

  it("matches seeded emails case-insensitively", () => {
    expect(nonSeededEmails(seeded.map((email) => email.toUpperCase()))).toEqual([])
  })
})
