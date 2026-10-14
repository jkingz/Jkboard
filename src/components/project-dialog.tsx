"use client"

import { useState } from "react"
import { Plus, SquarePen } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { useFlowBoard } from "@/data/flowboard-store"
import {
  dateFromToday,
  getMember,
  projectColorOptions,
  projectStatuses,
  type Project,
} from "@/data/flowboard"

const projectFormSchema = z.object({
  name: z.string().min(2, "Give the project a name."),
  key: z
    .string()
    .min(2, "Use a 2-4 letter key.")
    .max(4, "Use a 2-4 letter key.")
    .regex(/^[A-Za-z]+$/, "Letters only, no spaces."),
  description: z.string().optional(),
  status: z.enum(["planning", "active", "on-hold", "completed"]),
  dueDate: z.string().min(1, "Pick a target date."),
  color: z.string().min(1),
  memberIds: z.array(z.string()),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

interface ProjectDialogProps {
  /** When provided the dialog switches into edit mode. */
  project?: Project
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Supply to control the trigger; children are rendered inside it. */
  trigger?: React.ReactElement
  children?: React.ReactNode
}

function toFormValues(project: Project): ProjectFormValues {
  return {
    name: project.name,
    key: project.key,
    description: project.description,
    status: project.status,
    dueDate: project.dueDate,
    color: project.color,
    memberIds: project.memberIds,
  }
}

export function ProjectDialog({
  project,
  open,
  onOpenChange,
  trigger,
  children,
}: ProjectDialogProps) {
  const { members, actions } = useFlowBoard()
  const isEdit = Boolean(project)

  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const [values, setValues] = useState<ProjectFormValues>(() =>
    project
      ? toFormValues(project)
      : {
          name: "",
          key: "",
          description: "",
          status: "planning",
          dueDate: dateFromToday(30),
          color: projectColorOptions[0].value,
          memberIds: members.slice(0, 2).map((member) => member.id),
        }
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function reset() {
    setValues(
      project
        ? toFormValues(project)
        : {
            name: "",
            key: "",
            description: "",
            status: "planning",
            dueDate: dateFromToday(30),
            color: projectColorOptions[0].value,
            memberIds: members.slice(0, 2).map((member) => member.id),
          }
    )
    setErrors({})
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const result = projectFormSchema.safeParse(values)

    if (!result.success) {
      const nextErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message
      }
      setErrors(nextErrors)
      return
    }

    if (project) {
      await actions.updateProject(project.id, {
        ...result.data,
        description: result.data.description ?? "",
        key: result.data.key.toUpperCase(),
      })
      toast.add({
        type: "success",
        title: "Project updated",
        description: `${result.data.name} has been saved.`,
      })
    } else {
      const created = await actions.createProject({
        ...result.data,
        description: result.data.description ?? "",
        key: result.data.key.toUpperCase(),
        startDate: dateFromToday(0),
      })
      toast.add({
        type: "success",
        title: "Project created",
        description: `${created.name} is ready for tasks.`,
      })
    }

    reset()
    setOpen(false)
  }

  function toggleMember(memberId: string) {
    setValues((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter((id) => id !== memberId)
        : [...prev.memberIds, memberId],
    }))
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      {trigger ? (
        <DialogTrigger render={trigger}>{children}</DialogTrigger>
      ) : isEdit ? null : (
        <DialogTrigger render={<Button size="sm" className="cursor-pointer" />}>
          <Plus data-icon="inline-start" />
          New project
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit ${project!.name}` : "New project"}
          </DialogTitle>
          <DialogDescription>
            Set the scope, team and target date. Tasks can be added right after.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="project-name">Project name</FieldLabel>
              <Input
                id="project-name"
                placeholder="Website relaunch"
                value={values.name}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, name: event.target.value }))
                }
              />
              {errors.name && <FieldError errors={[{ message: errors.name }]} />}
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field data-invalid={!!errors.key}>
                <FieldLabel htmlFor="project-key">Key</FieldLabel>
                <Input
                  id="project-key"
                  placeholder="WEB"
                  maxLength={4}
                  value={values.key}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      key: event.target.value.toUpperCase(),
                    }))
                  }
                />
                {errors.key && <FieldError errors={[{ message: errors.key }]} />}
              </Field>

              <Field data-invalid={!!errors.dueDate}>
                <FieldLabel htmlFor="project-due">Target date</FieldLabel>
                <Input
                  id="project-due"
                  type="date"
                  value={values.dueDate}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, dueDate: event.target.value }))
                  }
                />
                {errors.dueDate && (
                  <FieldError errors={[{ message: errors.dueDate }]} />
                )}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="project-description">Description</FieldLabel>
              <Textarea
                id="project-description"
                rows={3}
                placeholder="What does done look like?"
                value={values.description ?? ""}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="project-status">Status</FieldLabel>
                <Select
                  items={projectStatuses}
                  value={values.status}
                  onValueChange={(value) =>
                    value &&
                    setValues(
                      (prev) =>
                        ({
                          ...prev,
                          status: value as ProjectFormValues["status"],
                        }) as ProjectFormValues
                    )
                  }
                >
                  <SelectTrigger id="project-status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {projectStatuses.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="size-4 text-muted-foreground" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Colour</FieldLabel>
                <div className="flex items-center gap-2">
                  {projectColorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-label={option.label}
                      aria-pressed={values.color === option.value}
                      onClick={() =>
                        setValues((prev) => ({ ...prev, color: option.value }))
                      }
                      className={cn(
                        "size-7 cursor-pointer rounded-full border-2 transition-transform hover:scale-110",
                        values.color === option.value
                          ? "border-foreground"
                          : "border-transparent"
                      )}
                      style={{ backgroundColor: option.value }}
                    />
                  ))}
                </div>
              </Field>
            </div>

            <Field>
              <FieldLabel>Team</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {members.map((member) => {
                  const selected = values.memberIds.includes(member.id)
                  return (
                    <button
                      key={member.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleMember(member.id)}
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary/10 font-medium"
                          : "hover:bg-accent"
                      )}
                    >
                      {getMember(member.id)?.name ?? member.name}
                    </button>
                  )
                })}
              </div>
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer">
              {isEdit ? (
                <>
                  <SquarePen data-icon="inline-start" />
                  Save changes
                </>
              ) : (
                <>
                  <Plus data-icon="inline-start" />
                  Create project
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}