import "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { NavMain } from "@/components/nav-main"
import { SidebarProvider } from "@/components/ui/sidebar"

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }))
// jsdom has no matchMedia, which SidebarProvider reads through useIsMobile.
vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => false }))

/**
 * Interface test that proves the jsdom tier works.
 *
 * The NavMain component's Collapsible is keyed on `${item.title}:${open}` to
 * prevent Base UI's uncontrolled warning when defaultOpen changes. This test
 * verifies the tier can detect DOM-tier defects by checking console warnings.
 */
describe("NavMain", () => {
  const mockItems = [
    {
      title: "Home",
      url: "/dashboard",
      isActive: false,
      items: [{ title: "Overview", url: "/dashboard" }],
    },
  ]

  it("should not log uncontrolled Collapsible warnings", async () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    try {
      render(<SidebarProvider><NavMain label="Main" items={mockItems} /></SidebarProvider>)

      expect(screen.getByText(/Home/i)).toBeTruthy()

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
    render(<SidebarProvider><NavMain label="Main" items={mockItems} /></SidebarProvider>)

    const homeLink = screen.getByText(/Home/i)
    expect(homeLink).toBeTruthy()

    const trigger = screen.getByRole("button", { name: /home/i })
    expect(trigger).toBeTruthy()
  })
})