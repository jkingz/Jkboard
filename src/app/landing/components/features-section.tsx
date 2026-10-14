"use client"

import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  LayoutList,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
        title: "Owners and roles",
        description: "Clear responsibility for every project.",
      },
      {
        icon: CheckCircle2,
        title: "Milestone tracking",
        description: "Know exactly what ships next.",
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
        title: "Priority that matters",
        description: "Urgent, high, medium and low at a glance.",
      },
      {
        icon: CalendarClock,
        title: "Due dates built in",
        description: "Overdue work surfaces automatically.",
      },
      {
        icon: Bell,
        title: "Saved views",
        description: "Return to the same filtered queue daily.",
      },
    ],
  },
  {
    id: "team-collaboration",
    kicker: "Team collaboration",
    title: "Shared context instead of status meetings",
    description:
      "Small teams move faster when everyone can see the same plan. FlowBoard keeps assignments, workload and recent activity in one shared workspace.",
    preview: "team",
    bullets: [
      {
        icon: Users,
        title: "Workload visibility",
        description: "Spot overload before it becomes a slip.",
      },
      {
        icon: MessageSquare,
        title: "Comments on tasks",
        description: "Discuss the work where it lives.",
      },
      {
        icon: ShieldCheck,
        title: "Guest collaborators",
        description: "Invite clients into a single project.",
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
        title: "Completion trends",
        description: "Created versus completed over time.",
      },
      {
        icon: CheckCircle2,
        title: "Progress by project",
        description: "Compare scope against finished work.",
      },
      {
        icon: CalendarClock,
        title: "Deadline forecasting",
        description: "Catch slipping timelines early.",
      },
    ],
  },
]

function FeatureBlockSection({ feature, reversed }: { feature: FeatureBlock; reversed: boolean }) {
  return (
    <div
      id={feature.id}
      className="grid scroll-mt-24 items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16"
    >
      <div
        className={
          reversed
            ? "flex flex-col gap-6 lg:col-start-2"
            : "flex flex-col gap-6"
        }
      >
        <Badge variant="outline" className="w-fit">
          {feature.kicker}
        </Badge>
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {feature.title}
          </h3>
          <p className="text-muted-foreground text-base text-pretty">
            {feature.description}
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {feature.bullets.map((bullet) => (
            <li
              key={bullet.title}
              className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors"
            >
              <div className="mt-0.5 flex shrink-0 items-center justify-center">
                <bullet.icon
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="text-foreground font-medium">{bullet.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {bullet.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={reversed ? "lg:col-start-1 lg:row-start-1" : ""}>
        <ProductPreview kind={feature.preview} />
      </div>
    </div>
  )
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-20 max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            Product Features
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything a small team needs to ship on time
          </h2>
          <p className="text-lg text-muted-foreground">
            Projects, tasks, collaboration and reporting — connected in one
            workspace instead of scattered across four different tools.
          </p>
        </div>

        <div className="flex flex-col gap-24">
          {features.map((feature, index) => (
            <FeatureBlockSection
              key={feature.id}
              feature={feature}
              reversed={index % 2 === 1}
            />
          ))}
        </div>

        <div className="mt-16 flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="cursor-pointer"
            nativeButton={false}
            render={<Link href="/sign-up" />}
          >
            Start your first project
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="cursor-pointer"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Explore the live demo
          </Button>
        </div>
      </div>
    </section>
  )
}