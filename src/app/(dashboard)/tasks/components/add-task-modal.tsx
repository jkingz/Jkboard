"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { z } from "zod"

import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AsyncButton } from "@/components/async-button"
import { toast } from "@/components/ui/toast"
import { useJkboard } from "@/data/jkboard-store"
import * as React from "react"
import {
  dateFromToday,
  taskPriorities,
  taskStatuses,
} from "@/data/jkboard"

const taskFormSchema = z.object({
  title: z.string().min(3, "Give the task a title."),
  projectId: z.string().min(1, "Pick a project."),
  status: z.enum(["todo", "in-progress", "in-review", "completed"]),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  assigneeId: z.string().min(1, "Pick an assignee."),
  dueDate: z.string().min(1, "Pick a due date."),
})

type TaskFormData = z.infer<typeof taskFormSchema>

interface AddTaskModalProps {
  /** Pre-selects a project — used by the project board header. */
  defaultProjectId?: string
  trigger?: React.ReactElement
}

export function AddTaskModal({
  defaultProjectId,
  trigger,
}: AddTaskModalProps) {
  const { projects, members, actions } = useJkboard()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = React.useTransition()

  const initialForm = (): TaskFormData => ({
    title: "",
    projectId: defaultProjectId ?? projects[0]?.id ?? "",
    status: "todo",
    priority: "medium",
    assigneeId: members[0]?.id ?? "",
    dueDate: dateFromToday(7),
  })

  const [formData, setFormData] = useState<TaskFormData>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const result = taskFormSchema.safeParse(formData)

    if (!result.success) {
      const nextErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message
      }
      setErrors(nextErrors)
      return
    }

    // The store toasts the failure; swallowing the throw here keeps a rejected
    // action from surfacing as an unhandled rejection. The button is disabled
    // while `pending`, so a second submit cannot fire.
    startTransition(async () => {
      const created = await actions.createTask(result.data)

      toast.add({
        type: "success",
        title: "Task created",
        description: `${created.title} was added to ${
          projects.find((project) => project.id === created.projectId)?.name ??
          "the workspace"
        }.`,
      })

      setFormData(initialForm())
      setErrors({})
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger
          render={<Button variant="default" size="sm" className="cursor-pointer" />}
        >
          <Plus data-icon="inline-start" />
          Add Task
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add new task</DialogTitle>
          <DialogDescription>
            Give the task an owner, a priority and a due date so it shows up on
            the board and the deadline calendar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="task-title">Task title</FieldLabel>
              <Input
                id="task-title"
                placeholder="Ship the onboarding checklist"
                value={formData.title}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, title: event.target.value }))
                }
              />
              {errors.title && <FieldError errors={[{ message: errors.title }]} />}
            </Field>

            <Field>
              <FieldLabel htmlFor="task-project">Project</FieldLabel>
              <Select
                items={projects.map((project) => ({
                  value: project.id,
                  label: project.name,
                }))}
                value={formData.projectId}
                onValueChange={(value) =>
                  value && setFormData((prev) => ({ ...prev, projectId: value }))
                }
              >
                <SelectTrigger id="task-project" className="w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="task-assignee">Assignee</FieldLabel>
              <Select
                items={members.map((member) => ({
                  value: member.id,
                  label: member.name,
                }))}
                value={formData.assigneeId}
                onValueChange={(value) =>
                  value && setFormData((prev) => ({ ...prev, assigneeId: value }))
                }
              >
                <SelectTrigger id="task-assignee" className="w-full">
                  <SelectValue placeholder="Select assignee" />
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
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="task-status">Status</FieldLabel>
              <Select
                items={taskStatuses}
                value={formData.status}
                onValueChange={(value) =>
                  value &&
                  setFormData(
                    (prev) =>
                      ({
                        ...prev,
                        status: value as TaskFormData["status"],
                      }) as TaskFormData
                  )
                }
              >
                <SelectTrigger id="task-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {taskStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center">
                          <status.icon className="mr-2 size-4 text-muted-foreground" />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
              <Select
                items={taskPriorities}
                value={formData.priority}
                onValueChange={(value) =>
                  value &&
                  setFormData(
                    (prev) =>
                      ({
                        ...prev,
                        priority: value as TaskFormData["priority"],
                      }) as TaskFormData
                  )
                }
              >
                <SelectTrigger id="task-priority" className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {taskPriorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <Field data-invalid={!!errors.dueDate}>
            <FieldLabel htmlFor="task-due">Due date</FieldLabel>
            <Input
              id="task-due"
              type="date"
              value={formData.dueDate}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, dueDate: event.target.value }))
              }
            />
            {errors.dueDate && <FieldError errors={[{ message: errors.dueDate }]} />}
          </Field>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <AsyncButton
              type="submit"
              pending={pending}
              pendingText="Creating"
              className="cursor-pointer"
            >
              <Plus data-icon="inline-start" />
              Create task
            </AsyncButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
