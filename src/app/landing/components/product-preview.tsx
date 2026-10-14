"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { CalendarClock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  formatShortDate,
  getProject,
  getTaskStatus,
  members,
  priorityClasses,
  projectProgressSeries,
  taskCompletionTrend,
  tasks,
} from "@/data/jkboard"

export type PreviewKind = "overview" | "board" | "tasks" | "team" | "analytics"

const previewTitles: Record<PreviewKind, string> = {
  overview: "Overview",
  board: "Project board",
  tasks: "All tasks",
  team: "Team workload",
  analytics: "Progress analytics",
}

const trendConfig = {
  completed: { label: "Completed", color: "var(--chart-1)" },
  created: { label: "Created", color: "var(--chart-3)" },
} satisfies ChartConfig

const progressConfig = {
  progress: { label: "Completion", color: "var(--chart-2)" },
} satisfies ChartConfig

const overviewStats = [
  { label: "Projects", value: "6" },
  { label: "Active tasks", value: "24" },
  { label: "Completed", value: "18" },
  { label: "Overdue", value: "3" },
]

const boardColumns = [
  { status: "todo", limit: 3 },
  { status: "in-progress", limit: 3 },
  { status: "in-review", limit: 2 },
  { status: "completed", limit: 2 },
] as const

/* -------------------------------------------------------------------------- */

function PreviewFrame({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-2xl ring-1 ring-foreground/5",
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-destructive/60" />
        <span className="size-2.5 rounded-full bg-warning/60" />
        <span className="size-2.5 rounded-full bg-success/60" />
        <span className="ml-3 truncate text-xs font-medium text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

function OverviewPreview() {
  const highlights = projectProgressSeries
    .filter((entry) => entry.progress > 0)
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {overviewStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border bg-background/60 px-3 py-2.5"
          >
            <p className="truncate text-xs text-muted-foreground">
              {stat.label}
            </p>
            <p className="text-xl font-semibold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-background/60 p-3">
        <ChartContainer config={trendConfig} className="h-[140px] w-full">
          <AreaChart data={taskCompletionTrend.slice(-8)}>
            <defs>
              <linearGradient id="previewCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-completed)" />
                <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="completed"
              type="natural"
              fill="url(#previewCompleted)"
              stroke="var(--color-completed)"
            />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="flex flex-col gap-3">
        {highlights.map((entry) => (
          <div key={entry.project} className="flex items-center gap-3">
            <span className="w-16 shrink-0 truncate text-xs font-medium">
              {entry.project}
            </span>
            <Progress value={entry.progress} className="flex-1" />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {entry.progress}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BoardPreview() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {boardColumns.map(({ status, limit }) => {
        const meta = getTaskStatus(status)
        const columnTasks = tasks
          .filter((task) => task.status === status)
          .slice(0, limit)

        return (
          <div key={status} className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <meta.icon className="size-3.5" />
              {meta.label}
              <span className="tabular-nums">({columnTasks.length})</span>
            </div>
            <div className="flex flex-col gap-2">
              {columnTasks.map((task) => {
                const project = getProject(task.projectId)
                return (
                  <div
                    key={task.id}
                    className="rounded-md border bg-background/70 p-2.5"
                  >
                    <p className="line-clamp-2 text-xs font-medium leading-snug">
                      {task.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-1.5">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {project?.key}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-1.5 text-[10px]",
                          priorityClasses[task.priority]
                        )}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TasksPreview() {
  const visible = tasks.slice(0, 6)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 px-1 pb-1 text-xs font-medium text-muted-foreground">
        <span className="flex-1">Task</span>
        <span className="w-20 shrink-0">Status</span>
        <span className="w-16 shrink-0">Priority</span>
        <span className="hidden w-20 shrink-0 sm:block">Due</span>
      </div>
      {visible.map((task) => {
        const status = getTaskStatus(task.status)
        return (
          <div
            key={task.id}
            className="flex items-center gap-3 rounded-md border bg-background/70 px-3 py-2"
          >
            <span className="min-w-0 flex-1 truncate text-xs font-medium">
              {task.title}
            </span>
            <span className="hidden w-16 shrink-0 truncate text-[10px] text-muted-foreground sm:block">
              {getProject(task.projectId)?.key}
            </span>
            <span className="flex w-20 shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
              <status.icon className="size-3" />
              {status.label}
            </span>
            <Badge
              variant="outline"
              className={cn("w-16 shrink-0 justify-center px-1 text-[10px]", priorityClasses[task.priority])}
            >
              {task.priority}
            </Badge>
            <span className="hidden w-20 shrink-0 items-center gap-1 text-[10px] tabular-nums text-muted-foreground sm:flex">
              <CalendarClock className="size-3" />
              {formatShortDate(task.dueDate)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function TeamPreview() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {members.length} teammates
        </span>
        <AvatarGroup>
          {members.slice(0, 5).map((member) => (
            <Avatar key={member.id} className="size-6">
              <AvatarFallback className="text-[10px]">
                {member.initials}
              </AvatarFallback>
              <AvatarBadge />
            </Avatar>
          ))}
        </AvatarGroup>
      </div>
      <div className="flex flex-col gap-2.5">
        {members.slice(0, 4).map((member) => {
          const open = tasks.filter(
            (task) => task.assigneeId === member.id && task.status !== "completed"
          ).length
          const max = Math.max(
            ...members.map(
              (candidate) =>
                tasks.filter(
                  (task) =>
                    task.assigneeId === candidate.id &&
                    task.status !== "completed"
                ).length
            ),
            1
          )

          return (
            <div key={member.id} className="flex items-center gap-3">
              <Avatar className="size-7">
                <AvatarFallback className="text-[10px]">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-xs font-medium">
                    {member.name}
                  </span>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {open} open
                  </span>
                </div>
                <Progress
                  value={Math.round((open / max) * 100)}
                  className="mt-1.5"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AnalyticsPreview() {
  return (
    <div className="flex flex-col gap-4">
      <ChartContainer config={progressConfig} className="h-[170px] w-full">
        <BarChart
          data={projectProgressSeries}
          layout="vertical"
          margin={{ left: 4 }}
        >
          <CartesianGrid horizontal={false} />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="project"
            tickLine={false}
            axisLine={false}
            width={38}
            tickMargin={4}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          <Bar dataKey="progress" fill="var(--color-progress)" radius={4} />
        </BarChart>
      </ChartContainer>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {projectProgressSeries.slice(0, 3).map((entry) => (
          <div
            key={entry.project}
            className="rounded-lg border bg-background/60 px-3 py-2.5"
          >
            <p className="truncate text-xs text-muted-foreground">
              {entry.name}
            </p>
            <p className="text-lg font-semibold tabular-nums">
              {entry.progress}%
            </p>
            <p className="text-[10px] text-muted-foreground">
              {entry.tasks} tasks
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

const previews: Record<PreviewKind, () => React.ReactElement> = {
  overview: OverviewPreview,
  board: BoardPreview,
  tasks: TasksPreview,
  team: TeamPreview,
  analytics: AnalyticsPreview,
}

/* -------------------------------------------------------------------------- */

export function ProductPreview({
  kind = "overview",
  className,
}: {
  kind?: PreviewKind
  className?: string
}) {
  const Body = previews[kind]

  return (
    <PreviewFrame title={previewTitles[kind]} className={className}>
      <Body />
    </PreviewFrame>
  )
}