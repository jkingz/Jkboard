"use client"

import Link from "next/link"
import { ArrowUpRight, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ProjectDialog } from "@/components/project-dialog"
import { cn } from "@/lib/utils"
import { useJkboard } from "@/data/jkboard-store"
import { daysUntil, formatShortDate, getTaskStatus, isOverdue } from "@/data/jkboard"

export default function OverviewPage() {
  const { projects, tasks, taskStats, projectById, projectProgress } = useJkboard()
  const overdue = tasks
    .filter(isOverdue)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4)
  const openProjects = projects.filter(({ status }) => status !== "completed")
  const upcoming = openProjects
    .filter(({ dueDate }) => daysUntil(dueDate) >= 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3)
  const progressProjects = openProjects.filter(({ status }) => status === "active").slice(0, 3)
  const summary = [
    { label: "Open tasks", value: taskStats.active },
    { label: "Projects", value: projects.length },
    { label: "Completed", value: taskStats.completed },
  ]

  return (
    <div className="flex flex-col gap-5 px-4 lg:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Workspace overview</h1>
        <ProjectDialog />
        <p className="col-span-2 text-sm text-muted-foreground">
          See what’s overdue and which projects are due next.
        </p>
      </div>

      <div className="grid gap-2 lg:grid-cols-[1.12fr_1fr]">
        <section aria-label="Overdue tasks" className="flex flex-wrap items-center gap-3 rounded-lg border border-tide bg-tide px-4 py-3 text-tide-foreground sm:px-5 sm:py-5">
          <span className="text-4xl leading-none font-semibold tracking-tighter tabular-nums sm:text-6xl">{taskStats.overdue}</span>
          <div className="mr-auto">
            <div className="flex items-center gap-1.5 font-semibold">
              <TriangleAlert className="size-3.5" />
              Overdue tasks
            </div>
            <p className="text-xs text-tide-foreground/90">Past their due dates</p>
          </div>
          <Link
            href="/tasks?due=overdue"
            className={cn(buttonVariants({ size: "sm" }), "bg-tide-foreground text-tide hover:bg-tide-foreground/90")}
          >
            Review <span className="sr-only">overdue tasks</span>
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </section>
        <dl className="grid grid-cols-3 divide-x overflow-hidden rounded-lg border bg-muted">
          {summary.map(({ label, value }) => (
            <div key={label} className="flex flex-col-reverse justify-center gap-0.5 px-3 py-2 sm:px-5">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-xl leading-none font-semibold tabular-nums sm:text-3xl">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card size="sm">
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle><h2>Overdue work</h2></CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">Oldest deadlines first</p>
            </div>
            <Link href="/tasks?due=overdue" className={buttonVariants({ size: "sm", variant: "outline" })}>
              Open tasks <ArrowUpRight data-icon="inline-end" />
            </Link>
          </CardHeader>
          <CardContent>
            {overdue.length ? (
              <ul className="divide-y border-t">
                {overdue.map((task) => (
                  <li key={task.id}>
                    <Link href={`/tasks?due=overdue&task=${encodeURIComponent(task.id)}`} className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-2 px-1 py-2.5 text-sm hover:bg-accent/60 sm:grid-cols-[3.7rem_minmax(0,1fr)_auto]">
                      <time dateTime={task.dueDate} className="row-span-2 text-xs font-semibold text-destructive tabular-nums">{formatShortDate(task.dueDate)}</time>
                      <span className="col-span-2 min-w-0 font-medium sm:col-span-1">{task.title}</span>
                      <span className="col-start-2 min-w-0 truncate text-xs text-muted-foreground">{projectById(task.projectId)?.name ?? task.reference}</span>
                      <Badge variant="secondary" className="col-start-3 justify-self-end sm:row-span-2 sm:row-start-1">{getTaskStatus(task.status).label}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-t py-3 text-sm text-muted-foreground">You’re caught up. There are no overdue tasks.</p>
            )}
          </CardContent>
        </Card>

        <Card size="sm" className="bg-muted">
          <CardHeader><CardTitle><h2>Upcoming project targets</h2></CardTitle></CardHeader>
          <CardContent>
            {upcoming.length ? (
              <ul className="divide-y border-t">
                {upcoming.map((project) => (
                  <li key={project.id}>
                    <Link href={`/projects/${project.id}`} className="flex items-baseline gap-2.5 px-1 py-3 text-sm hover:bg-accent/60">
                      <time dateTime={project.dueDate} className="w-12 shrink-0 text-xs font-semibold text-primary tabular-nums">{formatShortDate(project.dueDate)}</time>
                      <span>{project.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-t py-3 text-sm text-muted-foreground">No upcoming targets for open projects.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-2" aria-labelledby="project-progress">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="project-progress" className="font-semibold">Project progress</h2>
          <Link href="/projects" className="text-xs text-muted-foreground hover:underline">All projects</Link>
        </div>
        {progressProjects.length ? (
          <ul className="grid gap-2 sm:grid-cols-3">
            {progressProjects.map((project) => {
              const { total, completed, progress } = projectProgress(project.id)
              return (
                <li key={project.id}>
                  <Link href={`/projects/${project.id}`} className="block space-y-2 rounded-md border bg-card p-3 hover:bg-accent/60">
                    <span className="flex justify-between gap-2 text-sm">
                      <span className="min-w-0 font-medium">{project.name}</span>
                      <span className="shrink-0 text-muted-foreground tabular-nums">{completed}/{total}</span>
                    </span>
                    <Progress value={progress} aria-label={`Task completion for ${project.name}`} />
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No active projects.</p>
        )}
      </section>
    </div>
  )
}
