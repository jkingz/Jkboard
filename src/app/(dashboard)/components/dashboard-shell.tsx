"use client"

import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ThemeCustomizer,
  ThemeCustomizerTrigger,
} from "@/components/theme-customizer"
import { UpgradeToProButton } from "@/components/upgrade-to-pro-button"
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
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false)
  const { config } = useSidebarConfig()

  return (
    <JkboardProvider initialData={initialData} currentMember={currentMember}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3rem",
            "--header-height": "calc(var(--spacing) * 14)",
          } as React.CSSProperties
        }
        className={config.collapsible === "none" ? "sidebar-none-mode" : ""}
      >
        {config.side === "left" ? (
          <>
            <AppSidebar
              variant={config.variant}
              collapsible={config.collapsible}
              side={config.side}
              user={sessionUser}
            />
            <SidebarInset>
              <SiteHeader user={sessionUser} />
              <ContentArea>{children}</ContentArea>
              <SiteFooter />
            </SidebarInset>
          </>
        ) : (
          <>
            <SidebarInset>
              <SiteHeader />
              <ContentArea>{children}</ContentArea>
              <SiteFooter />
            </SidebarInset>
            <AppSidebar
              variant={config.variant}
              collapsible={config.collapsible}
              side={config.side}
              user={sessionUser}
            />
          </>
        )}

        {/* Theme Customizer */}
        <ThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} />
        <ThemeCustomizer
          open={themeCustomizerOpen}
          onOpenChange={setThemeCustomizerOpen}
        />
        <UpgradeToProButton />
      </SidebarProvider>
    </JkboardProvider>
  )
}

function ContentArea({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* The shell is already interactive once the layout has resolved, so
              page data streams in behind this boundary instead of holding the
              sidebar and header hostage to it. */}
          <React.Suspense fallback={<ContentFallback />}>
            {children}
          </React.Suspense>
        </div>
      </div>
    </div>
  )
}

/** Same shape as `DashboardLoading`'s main column, minus the chrome around it. */
function ContentFallback() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  )
}