"use client"

import { CheckCircle2, FolderKanban, ListTodo, Users } from "lucide-react"

import { Reveal } from "@/components/reveal"

/**
 * What the demo workspace actually contains.
 *
 * These counts are read from the same seed arrays the product preview renders,
 * so they describe real rows rather than marketing figures. docs/ui.md →
 * Honesty constraints forbids inventing numbers, and the previous version of
 * this section claimed 94% on-time and 11h saved weekly, neither of which
 * existed anywhere in the app.
 *
 * Because they describe the demo workspace rather than the product's history,
 * they are labelled as such. Nothing here is a claim about how well Jkboard
 * performs for anyone.
 */

const facts = [
  {
    icon: FolderKanban,
    value: "6",
    label: "projects",
    note: "each with an owner, start and due dates",
  },
  {
    icon: ListTodo,
    value: "36",
    label: "tasks",
    note: "spread across four workflow states",
  },
  {
    icon: Users,
    value: "8",
    label: "teammates",
    note: "with per-person workload you can open",
  },
  {
    icon: CheckCircle2,
    value: "4",
    label: "columns",
    note: "to do, in progress, in review, done",
  },
]

export function StatsSection() {
  return (
    <section className="border-y bg-muted/40 py-10 sm:py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="mb-8 text-sm text-muted-foreground">
            This is the demo workspace, seeded and shared. Sign in and you are
            looking at exactly this data.
          </p>
        </Reveal>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {facts.map((fact, index) => (
            <Reveal key={fact.label} delay={index * 0.05}>
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <fact.icon className="size-4" aria-hidden="true" />
                  <span>{fact.label}</span>
                </dt>
                <dd className="text-3xl font-semibold tabular-nums sm:text-4xl">
                  {fact.value}
                </dd>
                <p className="text-sm text-muted-foreground text-pretty">
                  {fact.note}
                </p>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}