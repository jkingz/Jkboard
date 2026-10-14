"use client"

import { useRouter } from "next/navigation"
import {
  Search,
  Bell,
  CalendarClock,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Link2,
  ListTodo,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import { projects } from "@/data/flowboard"

interface SearchItem {
  title: string
  url: string
  group: string
  icon?: LucideIcon
}

interface CommandSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter()

  const searchItems: SearchItem[] = [
    // Workspace
    {
      title: "Overview",
      url: "/dashboard",
      group: "Workspace",
      icon: LayoutDashboard,
    },
    {
      title: "Projects",
      url: "/projects",
      group: "Workspace",
      icon: FolderKanban,
    },
    { title: "Tasks", url: "/tasks", group: "Workspace", icon: ListTodo },
    {
      title: "Calendar",
      url: "/calendar",
      group: "Workspace",
      icon: CalendarClock,
    },
    { title: "Team", url: "/users", group: "Workspace", icon: Users },

    // Settings
    {
      title: "Profile",
      url: "/settings/user",
      group: "Settings",
      icon: User,
    },
    {
      title: "Security",
      url: "/settings/account",
      group: "Settings",
      icon: ShieldCheck,
    },
    {
      title: "Notifications",
      url: "/settings/notifications",
      group: "Settings",
      icon: Bell,
    },
    {
      title: "Plans & Billing",
      url: "/settings/billing",
      group: "Settings",
      icon: CreditCard,
    },
    {
      title: "Integrations",
      url: "/settings/connections",
      group: "Settings",
      icon: Link2,
    },
  ]

  const projectItems: SearchItem[] = projects.map((project) => ({
    title: project.name,
    url: `/projects/${project.id}`,
    group: "Projects",
    icon: FolderKanban,
  }))

  const groupedItems = [...searchItems, ...projectItems].reduce(
    (acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = []
      }
      acc[item.group].push(item)
      return acc
    },
    {} as Record<string, SearchItem[]>
  )

  const handleSelect = (url: string) => {
    router.push(url)
    onOpenChange(false)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command Search"
      description="Jump to a page or setting"
      className="sm:max-w-[640px]"
    >
      <Command>
        <CommandInput placeholder="What do you need?" autoFocus />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedItems).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => {
                const Icon = item.icon
                return (
                  <CommandItem
                    key={item.url}
                    value={item.title}
                    onSelect={() => handleSelect(item.url)}
                  >
                    {Icon && <Icon />}
                    {item.title}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="relative w-full justify-start font-normal text-muted-foreground sm:pr-12 md:w-36 lg:w-56"
    >
      <Search data-icon="inline-start" />
      Search...
      <Kbd className="absolute top-1/2 right-1.5 hidden -translate-y-1/2 sm:inline-flex">
        ⌘K
      </Kbd>
    </Button>
  )
}
