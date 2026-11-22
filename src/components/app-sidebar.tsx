"use client"

import * as React from "react"
import {
  CalendarClock,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  Search,
  SquareKanban,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Kbd } from "@/components/ui/kbd"
import { Logo } from "@/components/logo"
import { SidebarNotification } from "@/components/sidebar-notification"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export interface SidebarUser {
  name: string
  email: string
  image: string | null
}

export const settingsNavItems = [
  { title: "Profile", url: "/settings/user" },
  { title: "Security", url: "/settings/account" },
  { title: "Notifications", url: "/settings/notifications" },
  { title: "Plans & Billing", url: "/settings/billing" },
  { title: "Integrations", url: "/settings/connections" },
]

export const navGroups = [
    {
      label: "Workspace",
      items: [
        {
          title: "Overview",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Projects",
          url: "/projects",
          icon: FolderKanban,
        },
        {
          title: "Tasks",
          url: "/tasks",
          icon: ListTodo,
        },
        {
          title: "Calendar",
          url: "/calendar",
          icon: CalendarClock,
        },
        {
          title: "Team",
          url: "/users",
          icon: Users,
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          title: "Settings",
          url: "#",
          icon: Settings,
          items: settingsNavItems,
        },
        {
          title: "Marketing Site",
          url: "/landing",
          target: "_blank",
          icon: SquareKanban,
        },
      ],
    },
]

export function AppSidebar({
  user,
  onSearch,
  ...props
}: { user: SidebarUser; onSearch: () => void } & React.ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpenMobile } = useSidebar()

  function closeMobileSidebar() {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" onNavigate={closeMobileSidebar} />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Logo size={24} className="text-current" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Jkboard</span>
                <span className="truncate text-xs">Shared workspace</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="hidden md:block">
            <SidebarMenuButton
              tooltip="Search workspace"
              variant="outline"
              onClick={onSearch}
              className="text-muted-foreground"
            >
              <Search />
              <span className="min-w-0 flex-1 truncate text-xs">Search workspace</span>
              <Kbd className="ml-auto group-data-[collapsible=icon]:hidden">⌘K</Kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain
            key={group.label}
            label={group.label}
            items={group.items}
            onNavigate={closeMobileSidebar}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarNotification />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}


export function WorkspaceMobileNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Workspace"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-sidebar px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] text-sidebar-foreground md:hidden"
    >
      {navGroups[0].items.map(({ title, url, icon: Icon }) => {
        const active = pathname === url || pathname.startsWith(`${url}/`)
        return (
          <Link
            key={url}
            href={url}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium",
              active && "bg-sidebar-accent text-primary"
            )}
          >
            <Icon className="size-4" />
            {title}
          </Link>
        )
      })}
    </nav>
  )
}
