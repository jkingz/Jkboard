"use client"

import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import {
  ThemeCustomizer,
  ThemeCustomizerTrigger,
} from "@/components/theme-customizer"
import { UpgradeToProButton } from "@/components/upgrade-to-pro-button"
import { useSidebarConfig } from "@/hooks/use-sidebar-config"
import { FlowBoardProvider } from "@/data/flowboard-store"
import type { WorkspaceData } from "@/db/queries/flowboard"

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
  sessionUser,
  children,
}: {
  initialData: WorkspaceData
  sessionUser: SessionUser
  children: React.ReactNode
}) {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false)
  const { config } = useSidebarConfig()

  return (
    <FlowBoardProvider initialData={initialData}>
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
    </FlowBoardProvider>
  )
}

function ContentArea({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {children}
        </div>
      </div>
    </div>
  )
}