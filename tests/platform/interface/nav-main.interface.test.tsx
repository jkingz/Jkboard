import "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import * as Navigation from "next/navigation"
import { NavMain } from "@/components/nav-main"

/**
 * Interface test that proves the jsdom tier works.
 *
 * The NavMain component's Collapsible is keyed on `${item.title}:${open}` to
 * prevent Base UI's uncontrolled warning when defaultOpen changes. This test
 * verifies the tier can detect DOM-tier defects by checking console warnings.
 */
describe("NavMain", () => {
  const mockPathname = "/dashboard"
  const mockItems = [
    {
      title: "Home",
      url: "/dashboard",
      isActive: false,
      items: [{ title: "Overview", url: "/dashboard" }],
    },
  ]

  beforeEach(() => {
    vi.stubGlobal("usePathname", vi.fn().mockReturnValue(mockPathname))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("should not log uncontrolled Collapsible warnings", async () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    try {
      render(<NavMain label="Main" items={mockItems} />)

      expect(screen.getByText(/Home/i)).toBeInTheDocument()

      // Check for Base UI uncontrolled Collapsible warnings
      const uncontrolledWarnings = consoleWarnSpy.mock.calls.filter((call) =>
        call[0] && String(call[0]).toLowerCase().includes("uncontrolled")
      )

      expect(uncontrolledWarnings.length).toBe(0)
    } finally {
      consoleWarnSpy.mockRestore()
    }
  })

  it("should work correctly in jsdom environment", () => {
    render(<NavMain label="Main" items={mockItems} />)

    const homeLink = screen.getByText(/Home/i)
    expect(homeLink).toBeInTheDocument()

    const trigger = screen.getByRole("button", { name: /home/i })
    expect(trigger).toBeInTheDocument()
  })
})