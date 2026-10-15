"use client"

import Link from "next/link"
import { Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/reveal"
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo"
import { ProductPreview } from "./product-preview"

/**
 * The hero answers one question: is this real?
 *
 * docs/ui.md → Motion, item 3 allows exactly one transition here, and its purpose
 * is to draw the eye to the product preview, which is the page's only evidence
 * that the app exists and works.
 */

const heroPoints = [
  "Kanban board per project",
  "Task table with filters and sorting",
  "Deadline calendar",
  "Workload per teammate",
]

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-16 pb-16 sm:pt-24 sm:pb-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Headline first. No eyebrow badge above it (R-09): the label would
              restate the sentence beneath it. */}
          <Reveal>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              See what your team is working on, and what is late
            </h1>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              Projects, tasks and deadlines in one shared workspace. Built for
              small teams who already know each other and need the state of the
              work, not another reporting layer.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="cursor-pointer"
                nativeButton={false}
                render={<Link href="/sign-in" />}
              >
                <Play data-icon="inline-start" />
                Open the live demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="cursor-pointer"
                nativeButton={false}
                render={<Link href="/sign-up" />}
              >
                Create an account
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-6 rounded-lg border bg-muted/40 p-4">
              <p className="text-sm font-medium">
                No account needed. Use the demo credentials.
              </p>
              <dl className="mt-3 grid gap-1.5 font-mono text-sm sm:grid-cols-2">
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="select-all">{DEMO_EMAIL}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Password</dt>
                  <dd className="select-all">{DEMO_PASSWORD}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                The demo workspace is shared, so changes you make there are
                visible to other visitors.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {heroPoints.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <span
                    className="size-1 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* The single permitted hero transition (docs/ui.md → Motion). Purpose:
            direct attention to the only evidence on the page that the product
            is real. */}
        <Reveal className="relative mx-auto mt-16 max-w-6xl" delay={0.1}>
          <ProductPreview kind="overview" />
        </Reveal>
      </div>
    </section>
  )
}