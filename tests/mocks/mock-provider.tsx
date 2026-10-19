"use client"

import { useRouter } from "next/navigation"
import { ReactNode } from "react"

/**
 * Minimal mock provider for interface tests.
 *
 * Next.js components like NavMain use usePathname() and useRouter(), which
 * require a router context in SSR/client environments. This wraps the test
 * component with Next.js router providers.
 */
export function MockProvider({ children }: { children: ReactNode }) {
  return (
    <div id="mock-root">
      {/* usePathname is provided by Next.js routing, but in jsdom we need
          minimal mocks */}
      {children}
    </div>
  )
}

// Simple pathname stub for test context
let currentPathname = "/dashboard"
export function setMockPathname(pathname: string) {
  currentPathname = pathname
}

export function getMockPathname() {
  return currentPathname
}
