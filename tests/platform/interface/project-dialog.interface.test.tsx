import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ProjectDialog } from "@/components/project-dialog"
import { members, projects, type Project } from "@/data/jkboard"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock("@/data/jkboard-store", () => ({
  useJkboard: () => ({ members, actions: {} }),
}))

/**
 * Issue #23: the project board keeps one edit dialog mounted. After a save it
 * must reopen showing the Project as saved, not the values it was opened with.
 */
describe("ProjectDialog", () => {
  const pressed = (name: string) =>
    screen.getByRole("button", { name }).getAttribute("aria-pressed")

  it("reopens with the saved team, not the team it last opened with", () => {
    const before: Project = projects[0]
    const removed = members.find((m) => m.id === before.memberIds[1])!
    const after: Project = {
      ...before,
      name: "Renamed",
      memberIds: before.memberIds.filter((id) => id !== removed.id),
    }

    const { rerender } = render(<ProjectDialog project={before} open />)
    expect(pressed(removed.name)).toBe("true")

    rerender(<ProjectDialog project={before} open={false} />)
    rerender(<ProjectDialog project={after} open={false} />)
    rerender(<ProjectDialog project={after} open />)

    expect(pressed(removed.name)).toBe("false")
    expect(screen.getByDisplayValue("Renamed")).toBeTruthy()
  })

  it("drops unsaved changes when closed and reopened", () => {
    const project = projects[0]
    const member = members.find((m) => m.id === project.memberIds[1])!

    const { rerender } = render(<ProjectDialog project={project} open />)
    fireEvent.click(screen.getByRole("button", { name: member.name }))
    expect(pressed(member.name)).toBe("false")

    rerender(<ProjectDialog project={project} open={false} />)
    rerender(<ProjectDialog project={project} open />)

    expect(pressed(member.name)).toBe("true")
  })
})
