"use client"

import * as React from "react"
import { animate, useReducedMotion } from "motion/react"
import { usePathname } from "next/navigation"

import { AppSidebar, WorkspaceMobileNav } from "@/components/app-sidebar"
import { CommandSearch } from "@/components/command-search"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { WorkspaceContentSkeleton } from "./workspace-skeleton"
import { useSidebarConfig } from "@/hooks/use-sidebar-config"
import { JkboardProvider } from "@/data/jkboard-store"
import type { WorkspaceData } from "@/db/queries/jkboard"
import type { Member } from "@/data/jkboard"

/**
 * Client shell. The data it works with is loaded by the server layout and
 * handed down as `initialData`, so no client component ever imports the db.
 */
export interface SessionUser {
  name: string
  email: string
  image: string | null
}

export function DashboardShell({
  initialData,
  currentMember,
  sessionUser,
  children,
}: {
  initialData: WorkspaceData
  currentMember: Member
  sessionUser: SessionUser
  children: React.ReactNode
}) {
  const { config } = useSidebarConfig()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const openSearch = () => setSearchOpen(true)

  React.useEffect(() => {
    function onShortcut(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || (!event.metaKey && !event.ctrlKey)) return
      event.preventDefault()
      setSearchOpen((open) => !open)
    }

    document.addEventListener("keydown", onShortcut)
    return () => document.removeEventListener("keydown", onShortcut)
  }, [])


  return (
    <JkboardProvider initialData={initialData} currentMember={currentMember}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "13rem",
            "--sidebar-width-icon": "3rem",
            "--header-height": "calc(var(--spacing) * 14)",
          } as React.CSSProperties
        }
        className={`workspace bg-background ${config.collapsible === "none" ? "sidebar-none-mode" : ""}`}
      >
        {config.side === "left" ? (
          <>
            <AppSidebar
              variant={config.variant}
              collapsible={config.collapsible}
              side={config.side}
              user={sessionUser}
              onSearch={openSearch}
            />
            <SidebarInset className="min-w-0 border-sidebar-border md:border-l md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none">
              <SiteHeader user={sessionUser} onSearch={openSearch} />
              <ContentArea>{children}</ContentArea>
            </SidebarInset>
          </>
        ) : (
          <>
            <SidebarInset className="min-w-0 border-sidebar-border md:border-l md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none">
              <SiteHeader user={sessionUser} onSearch={openSearch} />
              <ContentArea>{children}</ContentArea>
            </SidebarInset>
            <AppSidebar
              variant={config.variant}
              collapsible={config.collapsible}
              side={config.side}
              user={sessionUser}
              onSearch={openSearch}
            />
          </>
        )}

        <WorkspaceMobileNav />
        <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </SidebarProvider>
    </JkboardProvider>
  )
}

function ContentArea({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="pt-4 pb-20 md:py-6">
          {/* The shell is already interactive once the layout has resolved, so
              page data streams in behind this boundary instead of holding the
              sidebar and header hostage to it. */}
          <React.Suspense fallback={<WorkspaceContentSkeleton />}>
            <WorkspaceRoute>{children}</WorkspaceRoute>
          </React.Suspense>
        </div>
      </div>
    </div>
  )
}

function WorkspaceRoute({ children }: { children: React.ReactNode }) {
  const content = React.useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const previousPath = React.useRef(pathname)
  const historyPath = React.useRef<string | null>(null)

  React.useEffect(() => {
    function onHistoryNavigation() {
      historyPath.current = window.location.pathname
    }

    window.addEventListener("popstate", onHistoryNavigation)
    return () => window.removeEventListener("popstate", onHistoryNavigation)
  }, [])

  React.useEffect(() => {
    if (previousPath.current === pathname) return

    const fromHistory = historyPath.current === pathname
    previousPath.current = pathname
    historyPath.current = null

    // Let the browser restore back/forward positions and handle fragment links.
    if (!fromHistory && !window.location.hash && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" })
    }
  }, [pathname, reduceMotion])

  React.useEffect(() => {
    if (!content.current || reduceMotion) return

    const animation = animate(
      content.current,
      { opacity: [0.65, 1], transform: ["translateY(6px)", "none"] },
      { duration: 0.24, ease: [0.2, 0, 0, 1] }
    )

    return () => animation.cancel()
  }, [pathname, reduceMotion])

  return (
    <div ref={content} className="flex flex-col gap-4 md:gap-6">
      {children}
    </div>
  )
}
