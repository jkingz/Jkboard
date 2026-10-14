"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
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
            FlowBoard gives individuals and small teams one place to plan
            projects, manage tasks, and see upcoming deadlines before they slip.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="text-base cursor-pointer"
              nativeButton={false}
              render={<Link href="/sign-up" />}
            >
              Get Started Free
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base cursor-pointer"
              nativeButton={false}
              render={<a href="#features" />}
            >
              Explore Features
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