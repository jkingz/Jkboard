"use client"

import Link from "next/link"
import { ArrowRight, CalendarClock, TriangleAlert } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useFlowBoard } from "@/data/flowboard-store"
import {
  formatShortDate,
  getProject,
  getTaskStatus,
  isOverdue,
  priorityClasses,
  priorityIcons,
} from "@/data/flowboard"

export function RecentTasks() {
  const { tasks, memberById } = useFlowBoard()

  const upcoming = tasks
    .filter((task) => task.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Recent tasks</CardTitle>
        <CardDescription>Closest deadlines across every project</CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/tasks" />}
          >
            View all
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead className="hidden @[560px]/card:table-cell">
                Project
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden @[420px]/card:table-cell">
                Priority
              </TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="hidden @[480px]/card:table-cell">
                Assignee
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {upcoming.map((task) => {
              const status = getTaskStatus(task.status)
              const PriorityIcon = priorityIcons[task.priority]
              const project = getProject(task.projectId)
              const assignee = memberById(task.assigneeId)
              const overdue = isOverdue(task)

              return (
                <TableRow key={task.id}>
                  <TableCell className="max-w-[220px]">
                    <Link
                      href="/tasks"
                      className="block truncate font-medium hover:underline"
                    >
                      {task.title}
                    </Link>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {task.reference}
                    </span>
                  </TableCell>
                  <TableCell className="hidden @[560px]/card:table-cell text-sm text-muted-foreground">
                    {project?.key}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm">
                      <status.icon className="size-3.5 text-muted-foreground" />
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell className="hidden @[420px]/card:table-cell">
                    <Badge
                      variant="outline"
                      className={priorityClasses[task.priority]}
                    >
                      <PriorityIcon />
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-sm tabular-nums",
                        overdue ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      {overdue ? (
                        <TriangleAlert className="size-3.5" />
                      ) : (
                        <CalendarClock className="size-3.5" />
                      )}
                      {formatShortDate(task.dueDate)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden @[480px]/card:table-cell text-sm text-muted-foreground">
                    {assignee?.name}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}