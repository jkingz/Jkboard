"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarClock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SearchTrigger } from "@/components/command-search"
import { ModeToggle } from "@/components/mode-toggle"
import { navGroups, settingsNavItems } from "@/components/app-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useJkboard } from "@/data/jkboard-store"

export function SiteHeader({
  user,
  onSearch,
}: {
  user?: { name: string; email: string; image: string | null }
  onSearch: () => void
}) {
  const pathname = usePathname()
  const { currentMember, projectById } = useJkboard()
  const [, section, detail] = pathname.split("/")
  const item = navGroups[0].items.find(({ url }) => url === `/${section}`)
  const settings = settingsNavItems.find(({ url }) => url === pathname)
  const trail = settings
    ? `Settings / ${settings.title}`
    : section === "projects" && detail
      ? `Projects / ${projectById(detail)?.name ?? "Project"}`
      : `Workspace / ${item?.title ?? "Overview"}`

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <span className="hidden min-w-0 flex-1 truncate text-sm text-muted-foreground md:block">
          {trail}
        </span>
        <Link href="/dashboard" className="mr-auto font-semibold tracking-tight md:hidden">
          Jkboard
        </Link>
        <div className="min-w-0 md:hidden">
          <SearchTrigger onClick={onSearch} />
        </div>
        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex"
            nativeButton={false}
            render={<Link href="/calendar" />}
          >
            <CalendarClock data-icon="inline-start" />
            Deadlines
          </Button>
          {user && (
            <Avatar size="sm" className="hidden md:flex" aria-label={user.name}>
              <AvatarFallback>{currentMember.initials}</AvatarFallback>
            </Avatar>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
