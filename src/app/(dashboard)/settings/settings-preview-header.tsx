"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { settingsNavItems } from "@/components/app-sidebar"
import { Info } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SettingsPreviewHeader({
  title,
  description,
  preview,
}: {
  title: string
  description: string
  preview: string
}) {
  const pathname = usePathname()

  return (
    <header className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto border-b">
        {settingsNavItems.map(({ title, url }) => (
          <Link
            key={url}
            href={url}
            className="workspace-view-tab whitespace-nowrap"
            aria-current={pathname === url ? "page" : undefined}
          >
            {title}
          </Link>
        ))}
      </nav>
      <Alert role="note" className="bg-accent px-3 py-2.5">
        <Info />
        <AlertTitle>Demo preview</AlertTitle>
        <AlertDescription>{preview}</AlertDescription>
      </Alert>
    </header>
  )
}
