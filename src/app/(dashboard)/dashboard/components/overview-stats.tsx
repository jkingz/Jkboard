"use client"

import {
  ArrowDown,
  ArrowUp,
  CircleCheck,
  CircleDot,
  FolderKanban,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useFlowBoard } from "@/data/flowboard-store"

import type {
  Project as FlowBoardProject,
  Task as FlowBoardTask,
  TaskStats,
} from "@/data/flowboard"

interface Metric {
  title: string
  value: number
  change: number
  icon: LucideIcon
  footer: string
  subfooter: string
}

function buildMetrics(
  projects: FlowBoardProject[],
  tasks: FlowBoardTask[],
  stats: TaskStats
): Metric[] {
  const inProgress = tasks.filter((task) => task.status === "in-progress").length
  const activeProjects = projects.filter(
    (project) => project.status === "active"
  ).length

  return [
    {
      title: "Total Projects",
      value: projects.length,
      change: 2,
      icon: FolderKanban,
      footer: "Two added this quarter",
      subfooter: `${activeProjects} currently active`,
    },
    {
      title: "Active Tasks",
      value: stats.active,
      change: 6,
      icon: CircleDot,
      footer: "Steady week over week",
      subfooter: `${inProgress} in progress right now`,
    },
    {
      title: "Completed Tasks",
      value: stats.completed,
      change: 12,
      icon: CircleCheck,
      footer: "Completion rate is climbing",
      subfooter: `${stats.completionRate}% of all tracked work`,
    },
    {
      title: "Overdue Tasks",
      value: stats.overdue,
      change: -3,
      icon: TriangleAlert,
      footer: "Down from last week",
      subfooter: "Worth a look on the calendar",
    },
  ]
}

export function OverviewStats() {
  const { projects, tasks, taskStats } = useFlowBoard()

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
      {buildMetrics(projects, tasks, taskStats).map((metric) => {
        const positive = metric.change >= 0
        const TrendIcon = positive ? ArrowUp : ArrowDown

        return (
          <Card key={metric.title} className="@container/card">
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <metric.icon className="size-4" />
                {metric.title}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metric.value}
              </CardTitle>
              <CardAction>
                <Badge
                  variant="outline"
                  className={
                    positive
                      ? "border-success/40 text-success"
                      : "border-destructive/40 text-destructive"
                  }
                >
                  <TrendIcon />
                  {positive ? "+" : ""}
                  {metric.change}%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 border-t-0 bg-transparent pt-0 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {metric.footer} <TrendIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">{metric.subfooter}</div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}