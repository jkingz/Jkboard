"use client"

import * as React from "react"
import {
  CalendarClock,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  SquareKanban,
  Users,
} from "lucide-react"
import Link from "next/link"
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
} from "@/components/ui/sidebar"

export interface SidebarUser {
  name: string
  email: string
  image: string | null
}

const navGroups = [
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
          items: [
            {
              title: "Profile",
              url: "/settings/user",
            },
            {
              title: "Security",
              url: "/settings/account",
            },
            {
              title: "Notifications",
              url: "/settings/notifications",
            },
            {
              title: "Plans & Billing",
              url: "/settings/billing",
            },
            {
              title: "Integrations",
              url: "/settings/connections",
            },
          ],
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
  ...props
}: { user: SidebarUser } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Logo size={24} className="text-current" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Jkboard</span>
                <span className="truncate text-xs">Project workspace</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarNotification />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
