"use client"

import * as React from "react"
import { ThemeProviderContext } from "@/contexts/theme-context"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const storedTheme = React.useSyncExternalStore(
    subscribeToStorage,
    () => {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored === "dark" || stored === "light" || stored === "system") return stored
      } catch {
        // A restricted browser can still use an in-memory theme.
      }
      return defaultTheme
    },
    () => defaultTheme
  )
  const [selectedTheme, setSelectedTheme] = React.useState<Theme>()
  const theme = selectedTheme ?? storedTheme

  React.useEffect(() => {
    const root = document.documentElement
    const system = window.matchMedia("(prefers-color-scheme: dark)")

    function applyTheme() {
      const resolvedTheme = theme === "system" ? system.matches ? "dark" : "light" : theme
      root.classList.toggle("dark", resolvedTheme === "dark")
      root.classList.toggle("light", resolvedTheme === "light")
    }

    applyTheme()
    if (theme === "system") {
      system.addEventListener("change", applyTheme)
      return () => system.removeEventListener("change", applyTheme)
    }
  }, [theme])

  const setTheme = React.useCallback((value: Theme) => {
    setSelectedTheme(value)
    try {
      localStorage.setItem(storageKey, value)
    } catch {
      // Keep the selection active for this visit when storage is unavailable.
    }
  }, [storageKey])
  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
