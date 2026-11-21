"use client"

import { Reveal } from "@/components/reveal"
import { cn } from "@/lib/utils"
import { ProductPreview } from "./product-preview"

/** Board, task table and calendar bands from the teal Paper board, alternating light and dark. */
const steps = [
  { title: "Filter to a project", body: "Focus on one project or see all work." },
  { title: "Narrow by status or assignee", body: "See what’s open and who owns it." },
  { title: "Sort by due date", body: "Bring the next deadline to the top." },
]

function Band({
  id,
  invert,
  heading,
  lede,
  children,
}: {
  id: string
  invert?: boolean
  heading: string
  lede: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={cn("landing-band py-18 lg:py-24", invert && "landing-invert")}>
      <div className="landing-container">
        <Reveal className="max-w-3xl">
          <h2 className="landing-heading">{heading}</h2>
          <p className="mt-6 max-w-xl text-lg/[25px] text-muted-foreground text-pretty">{lede}</p>
        </Reveal>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  )
}

export function WalkthroughSection() {
  return (
    <>
      <Band
        id="how-it-works"
        heading="Give every task a place."
        lede="Open a project and move tasks through four stages. Each card keeps its priority and owner in view."
      >
        <ProductPreview kind="board" />
      </Band>

      <Band
        id="tasks"
        invert
        heading="Find what needs attention."
        lede="The same tasks as a table. Filter, narrow and sort to see what comes next."
      >
        <div className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-18">
          <ol className="flex flex-col gap-6">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-4 border-t pt-4">
                <span className="text-[15px] font-semibold tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-[15px] font-semibold">{step.title}</span>
                  <span className="mt-1 block text-[15px] text-muted-foreground">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
          <ProductPreview kind="tasks" />
        </div>
      </Band>

      <Band
        id="calendar"
        heading="See the week ahead."
        lede="The deadline calendar makes it clear which tasks are due on the same day."
      >
        <ProductPreview kind="calendar" />
      </Band>
    </>
  )
}
