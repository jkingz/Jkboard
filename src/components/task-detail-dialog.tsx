"use client"

import Link from "next/link"
import { CalendarClock, ExternalLink, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { useJkboard } from "@/data/jkboard-store"
import {
  formatDate,
  isOverdue,
  priorityClasses,
  priorityIcons,
  taskPriorities,
  taskStatuses,
} from "@/data/jkboard"

interface TaskDetailDialogProps {
  taskId: string | null
  onOpenChange: (open: boolean) => void
}

export function TaskDetailDialog({
  taskId,
  onOpenChange,
}: TaskDetailDialogProps) {
  const { taskById, projectById, memberById, members, actions } =
    useJkboard()

  const task = taskId ? taskById(taskId) : undefined

  if (!task) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Task unavailable</DialogTitle>
            <DialogDescription>
              This task no longer exists in the workspace.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const project = projectById(task.projectId)
  const assignee = memberById(task.assigneeId)
  const status = taskStatuses.find((entry) => entry.value === task.status)!
  const PriorityIcon = priorityIcons[task.priority]
  const overdue = isOverdue(task)

  function notify(message: string) {
    toast.add({
      type: "success",
      title: message,
      description: task!.title,
    })
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs tabular-nums">
              {task.reference}
            </span>
            {project && (
              <>
                <span aria-hidden="true">·</span>
                <span
                  className="flex items-center gap-1.5"
                  style={{ color: "inherit" }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: project.color }}
                    aria-hidden="true"
                  />
                  {project.name}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={priorityClasses[task.priority]}>
              <PriorityIcon />
              {task.priority}
            </Badge>
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
              {formatDate(task.dueDate)}
              {overdue && " · overdue"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="task-detail-status">Status</FieldLabel>
              <Select
                items={taskStatuses}
                value={task.status}
                onValueChange={(value) => {
                  if (!value) return
                  actions.setTaskStatus(
                    task.id,
                    value as typeof task.status
                  )
                  notify("Status updated")
                }}
              >
                <SelectTrigger id="task-detail-status" className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {taskStatuses.map((entry) => (
                      <SelectItem key={entry.value} value={entry.value}>
                        <div className="flex items-center gap-2">
                          <entry.icon className="size-4 text-muted-foreground" />
                          {entry.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="task-detail-priority">Priority</FieldLabel>
              <Select
                items={taskPriorities}
                value={task.priority}
                onValueChange={(value) => {
                  if (!value) return
                  actions.updateTask(task.id, {
                    priority: value as typeof task.priority,
                  })
                  notify("Priority updated")
                }}
              >
                <SelectTrigger id="task-detail-priority" className="w-full">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {taskPriorities.map((entry) => (
                      <SelectItem key={entry.value} value={entry.value}>
                        {entry.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="task-detail-assignee">Assignee</FieldLabel>
              <Select
                items={members.map((member) => ({
                  value: member.id,
                  label: member.name,
                }))}
                value={task.assigneeId}
                onValueChange={(value) => {
                  if (!value) return
                  actions.updateTask(task.id, { assigneeId: value })
                  notify("Assignee updated")
                }}
              >
                <SelectTrigger id="task-detail-assignee" className="w-full">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
            <status.icon className="size-4 text-muted-foreground" />
            <span className="text-sm">
              Currently <strong>{status.label.toLowerCase()}</strong>
              {assignee && <> and owned by {assignee.name}</>} in{" "}
              {project?.name ?? "an unknown project"}.
            </span>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            nativeButton={false}
            render={<Link href={project ? `/projects/${project.id}` : "/projects"} />}
          >
            Open project board
            <ExternalLink data-icon="inline-end" />
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={async () => {
                try {
                  const copy = await actions.duplicateTask(task.id)
                  if (copy) {
                    toast.add({
                      type: "success",
                      title: "Task duplicated",
                      description: `${copy.title} was added to the board.`,
                    })
                  }
                } catch (error) {
                  toast.add({
                    type: "error",
                    title: "Could not duplicate",
                    description:
                      error instanceof Error ? error.message : "Please try again.",
                  })
                }
              }}
            >
              Duplicate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer"
              onClick={async () => {
                const title = task.title
                onOpenChange(false)
                try {
                  await actions.deleteTask(task.id)
                  toast.add({
                    type: "info",
                    title: "Task deleted",
                    description: `${title} was removed from the workspace.`,
                  })
                } catch (error) {
                  toast.add({
                    type: "error",
                    title: "Could not delete",
                    description:
                      error instanceof Error ? error.message : "Please try again.",
                  })
                }
              }}
            >
              Delete task
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}