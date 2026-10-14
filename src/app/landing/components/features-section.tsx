"use client"

import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  LayoutList,
  ListChecks,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/reveal"
import { ProductPreview, type PreviewKind } from "./product-preview"

interface FeatureBlock {
  id: string
  kicker: string
  title: string
  description: string
  preview: PreviewKind
  bullets: { icon: typeof Users; title: string; description: string }[]
}

const features: FeatureBlock[] = [
  {
    id: "project-management",
    kicker: "Project management",
    title: "Every project, scoped and visible",
    description:
      "Group work into projects with owners, start dates and due dates. Move tasks across columns, watch progress climb, and see who is blocked before the standup meeting.",
    preview: "board",
    bullets: [
      {
        icon: FolderKanban,
        title: "Kanban boards",
        description: "To do, in progress, in review and done.",
      },
      {
        icon: ShieldCheck,
        title: "One owner per project",
        description: "Transferred automatically if they leave.",
      },
      {
        icon: CalendarClock,
        title: "Start and due dates",
        description: "Every project carries both.",
      },
    ],
  },
  {
    id: "task-tracking",
    kicker: "Task tracking",
    title: "From to-do to done, without losing context",
    description:
      "Create a task in seconds, set a priority, assign an owner and give it a due date. Filter by status, project or assignee to find exactly what needs attention today.",
    preview: "tasks",
    bullets: [
      {
        icon: LayoutList,
        title: "Four priorities",
        description: "Urgent, high, medium and low.",
      },
      {
        icon: CalendarClock,
        title: "Overdue surfaces itself",
        description: "Counted in UTC, so timezones cannot skew it.",
      },
      {
        icon: ListChecks,
        title: "Filter and sort",
        description: "By status, project, assignee or due date.",
      },
    ],
  },
  {
    id: "team-collaboration",
    kicker: "Team collaboration",
    title: "Shared context instead of status meetings",
    description:
      "Small teams move faster when everyone can see the same plan. Jkboard keeps assignments, workload and recent activity in one shared workspace.",
    preview: "team",
    bullets: [
      {
        icon: Users,
        title: "Workload per person",
        description: "Open and completed, side by side.",
      },
      {
        icon: UserPlus,
        title: "Invite by email",
        description: "They claim the account by signing in.",
      },
      {
        icon: ShieldCheck,
        title: "One shared workspace",
        description: "Not separate spaces per project.",
      },
    ],
  },
  {
    id: "progress-analytics",
    kicker: "Progress analytics",
    title: "Know how the work is actually going",
    description:
      "Completion trends and per-project progress turn a wall of tickets into a clear answer to the only question that matters: are we on track?",
    preview: "analytics",
    bullets: [
      {
        icon: BarChart3,
        title: "Created versus completed",
        description: "Twelve weeks at a glance.",
      },
      {
        icon: CheckCircle2,
        title: "Progress per project",
        description: "Finished work against total scope.",
      },
      {
        icon: CalendarClock,
        title: "Deadline calendar",
        description: "What is due, and what is late.",
      },
    ],
  },
]

function FeatureBlockSection({
  feature,
  reversed,
  index,
}: {
  feature: FeatureBlock
  reversed: boolean
  index: number
}) {
  return (
    <Reveal
      id={feature.id}
      className="grid scroll-mt-24 items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16"
    >
      <div
        className={
          reversed
            ? "flex min-w-0 flex-col gap-6 lg:col-start-2"
            : "flex min-w-0 flex-col gap-6"
        }
      >
        {/* The kicker is plain text, not a badge: it labels the section rather
            than announcing a status (R-09). */}
        <p className="text-sm text-muted-foreground">{feature.kicker}</p>
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {feature.title}
          </h3>
          <p className="text-muted-foreground text-base text-pretty">
            {feature.description}
          </p>
        </div>

        <ul className="grid gap-x-6 gap-y-5">
          {feature.bullets.map((bullet) => (
            <li key={bullet.title} className="flex items-start gap-3">
              <bullet.icon
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium">{bullet.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {bullet.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={
          reversed ? "min-w-0 lg:col-start-1 lg:row-start-1" : "min-w-0"
        }
      >
        <ProductPreview kind={feature.preview} />
      </div>
      <span className="sr-only">{`Feature ${index + 1} of ${features.length}`}</span>
    </Reveal>
  )
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <Reveal>
          <div className="mb-16 max-w-2xl">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Four views of the same workspace
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Each one answers a different question. Nothing here is a mockup:
              every screenshot below is rendered from the components the app
              actually uses.
            </p>
          </div>
        </Reveal>

        <div className="flex flex-col gap-20 sm:gap-24">
          {features.map((feature, index) => (
            <FeatureBlockSection
              key={feature.id}
              feature={feature}
              index={index}
              reversed={index % 2 === 1}
            />
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-16 flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              className="cursor-pointer"
              nativeButton={false}
              render={<Link href="/sign-up" />}
            >
              Create an account
              <ArrowRight data-icon="inline-end" />
            </Button>
            {/* /sign-in, not /dashboard: the proxy bounces anonymous visitors
                off the dashboard straight back here. */}
            <Button
              size="lg"
              variant="outline"
              className="cursor-pointer"
              nativeButton={false}
              render={<Link href="/sign-in" />}
            >
              Open the live demo
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}