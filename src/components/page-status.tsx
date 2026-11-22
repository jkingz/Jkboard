import type { ReactNode } from "react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PageStatus({
  code,
  title,
  description,
  href = "/landing",
  linkLabel = "Back to Jkboard",
  inline = false,
  children,
}: {
  code: string
  title: string
  description: string
  href?: string
  linkLabel?: string
  inline?: boolean
  children?: ReactNode
}) {
  return (
    <section className={cn("grid place-items-center px-5 py-12", inline ? "min-h-80" : "min-h-svh")}>
      <div className="flex w-full max-w-lg flex-col items-start gap-4 rounded-lg border bg-card p-6 sm:p-8">
        <span className="rounded-md bg-secondary px-2.5 py-1 text-sm font-medium tabular-nums">{code}</span>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {children}
          <Link href={href} className={buttonVariants({ variant: children ? "outline" : "default" })}>
            {linkLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
