"use client"

import * as React from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { CalendarClock, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useJkboard } from "@/data/jkboard-store"
import {
  daysUntil,
  formatDate,
  getProject,
  getTaskStatus,
  isOverdue,
  priorityClasses,
  priorityIcons,
  type Task,
} from "@/data/jkboard"

export function DeadlineCalendar() {
  const { tasks, projects } = useJkboard()
  const [selected, setSelected] = React.useState<Date>(new Date())
  const [month, setMonth] = React.useState<Date>(new Date())

  const deadlinesByDay = React.useMemo(() => {
    const map = new Map<string, Task[]>()

    for (const task of tasks) {
      const key = format(parseISO(task.dueDate), "yyyy-MM-dd")
      map.set(key, [...(map.get(key) ?? []), task])
    }

    return map
  }, [tasks])

  const busyDays = React.useMemo(
    () => [...deadlinesByDay.keys()].map((key) => parseISO(key)),
    [deadlinesByDay]
  )

  const overdueDays = React.useMemo(
    () =>
      [...deadlinesByDay.entries()]
        .filter(([, dayTasks]) => dayTasks.some(isOverdue))
        .map(([key]) => parseISO(key)),
    [deadlinesByDay]
  )

  const selectedTasks = React.useMemo(
    () => deadlinesByDay.get(format(selected, "yyyy-MM-dd")) ?? [],
    [deadlinesByDay, selected]
  )

  const upcoming = React.useMemo(
    () =>
      [...tasks]
        .filter((task) => task.status !== "completed")
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 8),
    [tasks]
  )

  const openProjects = projects
    .filter((project) => project.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  return (
    <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Deadline calendar</CardTitle>
          <CardDescription>
            Select a day to see every task due on it. Dotted days have
            deadlines; red days include overdue work.
          </CardDescription>
          <CardAction>
            <Badge variant="outline">
              <CalendarClock />
              {busyDays.length} days with deadlines
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={selected}
            onSelect={(date) => date && setSelected(date)}
            className="w-full [--cell-size:--spacing(11)]"
            modifiers={{
              busy: busyDays,
              overdue: overdueDays,
            }}
            modifiersClassNames={{
              busy:
                "after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-primary",
              overdue: "text-destructive",
            }}
          />

          <div className="flex flex-col gap-3 border-t pt-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">
                {format(selected, "EEEE, MMMM d")}
              </h3>
              <Badge variant="secondary">{selectedTasks.length} due</Badge>
            </div>

            {selectedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing is due on this day.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {selectedTasks.map((task) => (
                  <DeadlineRow key={task.id} task={task} />
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Next up</CardTitle>
            <CardDescription>Closest open deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {upcoming.map((task) => (
                <DeadlineRow key={task.id} task={task} showProject />
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project milestones</CardTitle>
            <CardDescription>Target dates for open projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {openProjects.map((project) => {
                const remaining = daysUntil(project.dueDate)

                return (
                  <li
                    key={project.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {project.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-xs tabular-nums",
                        remaining < 0
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatDate(project.dueDate)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DeadlineRow({
  task,
  showProject = false,
}: {
  task: Task
  showProject?: boolean
}) {
  const { memberById } = useJkboard()
  const status = getTaskStatus(task.status)
  const PriorityIcon = priorityIcons[task.priority]
  const project = getProject(task.projectId)
  const assignee = memberById(task.assigneeId)
  const overdue = isOverdue(task)

  return (
    <li className="flex items-center gap-3 rounded-md border bg-background/60 px-3 py-2">
      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href="/tasks"
          className="truncate text-sm font-medium hover:underline"
        >
          {task.title}
        </Link>
        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <status.icon className="size-3" />
            {status.label}
          </span>
          {showProject && project && <span>· {project.key}</span>}
          <span className={cn("tabular-nums", overdue && "text-destructive")}>
            {overdue
              ? `Overdue by ${Math.abs(daysUntil(task.dueDate))}d`
              : formatDate(task.dueDate)}
          </span>
        </span>
      </div>

      <Badge variant="outline" className={priorityClasses[task.priority]}>
        <PriorityIcon />
        {task.priority}
      </Badge>

      {assignee && (
        <Avatar className="size-6 shrink-0">
          <AvatarFallback className="text-[10px]">
            {assignee.initials}
          </AvatarFallback>
        </Avatar>
      )}

      {overdue && <TriangleAlert className="size-4 shrink-0 text-destructive" />}
    </li>
  )
}