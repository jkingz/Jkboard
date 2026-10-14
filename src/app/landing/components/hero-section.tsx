"use client"

import Link from "next/link"
import { ArrowRight, Play, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo"
import { Badge } from "@/components/ui/badge"
import { DotPattern } from "@/components/dot-pattern"
import { ProductPreview } from "./product-preview"

const heroHighlights = [
  "Kanban boards and list views",
  "Deadlines and workload at a glance",
  "Progress analytics out of the box",
]

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 pt-16 sm:pt-20 pb-16"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <DotPattern className="opacity-100" size="md" fadeStyle="ellipse" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Announcement Badge */}
          <div className="mb-8 flex justify-center">
            <Badge variant="outline" className="px-4 py-2">
              <Sparkles className="fill-current" />
              New: Deadline calendar and workload views
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Organize every project and
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}
              track the work{" "}
            </span>
            that matters
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground text-pretty sm:text-xl">
            Jkboard gives individuals and small teams one place to plan
            projects, manage tasks, and see upcoming deadlines before they slip.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="text-base cursor-pointer"
              nativeButton={false}
              render={<Link href="/sign-in" />}
            >
              Try the live demo
              <Play data-icon="inline-end" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base cursor-pointer"
              nativeButton={false}
              render={<Link href="/sign-up" />}
            >
              Get Started Free
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>

          {/* Demo credentials, visible without an account */}
          <div className="mx-auto mt-6 max-w-md rounded-lg border border-dashed bg-muted/40 p-4 text-left">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Play className="size-4 text-primary" />
              Look around first — no account needed
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              Sign in with the demo account to explore a workspace with real
              projects, tasks and teammates.
            </p>
            <dl className="grid gap-1 font-mono text-xs">
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-muted-foreground">Email</dt>
                <dd className="select-all">{DEMO_EMAIL}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-20 shrink-0 text-muted-foreground">Password</dt>
                <dd className="select-all">{DEMO_PASSWORD}</dd>
              </div>
            </dl>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full cursor-pointer"
              nativeButton={false}
              render={<Link href="/sign-in" />}
            >
              Open the demo workspace
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>

          <ul className="mx-auto mt-8 flex max-w-2xl flex-col items-start gap-2 text-left text-sm text-muted-foreground sm:items-center sm:justify-center">
            {heroHighlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        {/* Product preview, built from the same dashboard UI */}
        <div className="relative mx-auto mt-16 max-w-6xl">
          <div
            className="absolute -top-8 left-1/2 h-24 w-[90%] -translate-x-1/2 rounded-full bg-primary/50 blur-3xl lg:h-80"
            aria-hidden="true"
          />
          <div className="relative">
            <ProductPreview kind="overview" />
          </div>
        </div>
      </div>
    </section>
  )
}