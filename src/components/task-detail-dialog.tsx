"use client"

import Link from "next/link"
import { useId } from "react"
import { CalendarClock, ExternalLink, TriangleAlert, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
  inline?: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailDialog({
  taskId,
  inline = false,
  onOpenChange,
}: TaskDetailDialogProps) {
  const { taskById, projectById, members, actions } =
    useJkboard()

  const heading = useId()
  const task = taskId ? taskById(taskId) : undefined

  if (!task) return null

  const project = projectById(task.projectId)
  const PriorityIcon = priorityIcons[task.priority]
  const overdue = isOverdue(task)

  function notify(message: string) {
    toast.add({
      type: "success",
      title: message,
      description: task!.title,
    })
  }

  const context = (
    <>
      <span className="font-mono text-xs tabular-nums">{task.reference}</span>
      {project && <><span aria-hidden="true">·</span><span>{project.name}</span></>}
    </>
  )

  const fields = (
    <>
      <div className="flex flex-col gap-4 px-5">
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

        <div className="grid gap-4">
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
      </div>

      <div className="mt-auto flex flex-wrap justify-between gap-2 p-4">
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
              const copy = await actions.duplicateTask(task.id)
              if (copy) {
                toast.add({
                  type: "success",
                  title: "Task duplicated",
                  description: `${copy.title} was added to the board.`,
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
              await actions.deleteTask(task.id)
              toast.add({
                type: "info",
                title: "Task deleted",
                description: `${title} was removed from the workspace.`,
              })
            }}
          >
            Delete task
          </Button>
        </div>
      </div>
    </>
  )

  if (inline) {
    return (
      <aside aria-labelledby={heading} className="rounded-lg border bg-muted motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-2 motion-safe:duration-200">
        <div className="flex items-start justify-between gap-2 border-b p-4">
          <div className="min-w-0">
            <p className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">{context}</p>
            <h2 id={heading} className="text-xl font-semibold tracking-tight">{task.title}</h2>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Close task details" onClick={() => onOpenChange(false)}>
            <X />
          </Button>
        </div>
        <div className="pt-4">{fields}</div>
      </aside>
    )
  }

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="task-detail overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-md motion-reduce:transition-none">
        <SheetHeader className="border-b px-5 pt-6 pr-12">
          <SheetTitle className="text-xl font-semibold tracking-tight">{task.title}</SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2">{context}</SheetDescription>
        </SheetHeader>
        {fields}
      </SheetContent>
    </Sheet>
  )
}
