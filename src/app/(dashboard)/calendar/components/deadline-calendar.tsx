"use client"

import * as React from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  dateFromToday,
  daysUntil,
  formatDate,
  formatShortDate,
  getTaskStatus,
  isOverdue,
  priorityClasses,
  priorityIcons,
  type Task,
} from "@/data/jkboard"

export function DeadlineCalendar({ initialDate }: { initialDate: string }) {
  const { tasks, projects } = useJkboard()
  const [selected, setSelected] = React.useState(() => parseISO(initialDate))
  const [month, setMonth] = React.useState(() => parseISO(initialDate))

  const deadlinesByDay = React.useMemo(() => {
    const map = new Map<string, Task[]>()

    for (const task of tasks) {
      const key = format(parseISO(task.dueDate), "yyyy-MM-dd")
      map.set(key, [...(map.get(key) ?? []), task])
    }

    return map
  }, [tasks])

  const selectedKey = format(selected, "yyyy-MM-dd")
  const selectedTargets = projects.filter(({ dueDate }) => dueDate === selectedKey)
  const targetDays = projects.map(({ dueDate }) => parseISO(dueDate))

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
    () => deadlinesByDay.get(selectedKey) ?? [],
    [deadlinesByDay, selectedKey]
  )

  const upcoming = React.useMemo(
    () =>
      [...tasks]
        .filter((task) => task.status !== "completed" && !isOverdue(task))
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 8),
    [tasks]
  )

  const openProjects = projects
    .filter((project) => project.status !== "completed" && daysUntil(project.dueDate) >= 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  return (
    <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
      <Card size="sm" className="min-w-0">
        <CardHeader>
          <CardTitle>Deadline calendar</CardTitle>
          <CardDescription>Select a date to open its agenda.</CardDescription>
          <CardAction>
            <Button size="sm" variant="outline" onClick={() => {
              const today = parseISO(dateFromToday(0))
              setSelected(today)
              setMonth(today)
            }}>Today</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            today={parseISO(initialDate)}
            month={month}
            onMonthChange={setMonth}
            selected={selected}
            onSelect={(date) => date && setSelected(date)}
            className="w-full px-0 [--cell-size:clamp(1.75rem,8vw,3.75rem)]"
            modifiers={{
              busy: busyDays,
              target: targetDays,
              overdue: overdueDays,
            }}
            modifiersClassNames={{
              busy:
                "after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-primary",
              overdue: "text-destructive",
              target: "ring-1 ring-inset ring-ring rounded-md",
            }}
          />

          <div aria-label="Calendar legend" className="flex flex-wrap gap-3 border-t pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-1.5 rounded-full bg-primary" /> Task deadline</span>
            <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-2.5 rounded-sm border border-ring" /> Project target</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex min-w-0 flex-col gap-3">
        <Card size="sm" className="bg-muted">
          <CardHeader>
            <CardTitle>{format(selected, "EEEE, MMMM d")}</CardTitle>
            <CardDescription>Selected date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedTasks.length ? (
              <ul className="space-y-2">
                {selectedTasks.map((task) => <DeadlineRow key={task.id} task={task} />)}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks due on this date.</p>
            )}
            {selectedTargets.length > 0 && (
              <ul className="space-y-2 border-t pt-3">
                {selectedTargets.map((project) => (
                  <li key={project.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">Project target</Badge>
                    <Link href={`/projects/${project.id}`} className="font-medium hover:underline">{project.name}</Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader><CardTitle>Upcoming project targets</CardTitle></CardHeader>
          <CardContent>
            {openProjects.length ? (
              <ul className="divide-y border-t">
                {openProjects.map((project) => (
                  <li key={project.id}>
                    <Link href={`/projects/${project.id}`} className="flex gap-2 py-2 text-sm hover:underline">
                      <time dateTime={project.dueDate} className="w-12 shrink-0 text-xs font-medium tabular-nums">{formatShortDate(project.dueDate)}</time>
                      {project.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming targets for open projects.</p>
            )}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader><CardTitle>Upcoming task deadlines</CardTitle></CardHeader>
          <CardContent>
            {upcoming.length ? (
              <ul className="space-y-2">
                {upcoming.map((task) => <DeadlineRow key={task.id} task={task} showProject />)}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming task deadlines.</p>
            )}
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
  const { memberById, projectById } = useJkboard()
  const status = getTaskStatus(task.status)
  const PriorityIcon = priorityIcons[task.priority]
  const project = projectById(task.projectId)
  const assignee = memberById(task.assigneeId)
  const overdue = isOverdue(task)

  return (
    <li className="flex items-center gap-3 rounded-md border bg-background/60 px-3 py-2">
      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          href={`/tasks?task=${encodeURIComponent(task.id)}`}
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