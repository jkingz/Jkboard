"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { useJkboard } from "@/data/jkboard-store"

const inviteSchema = z.object({
  name: z.string().min(2, "Enter their full name."),
  email: z.string().email("Enter a valid email address."),
  role: z.string().min(1, "Choose a role."),
})

export type InviteValues = z.infer<typeof inviteSchema>

const roleOptions = [
  "Product Lead",
  "Engineering Lead",
  "Product Designer",
  "Frontend Engineer",
  "Backend Engineer",
  "QA Engineer",
  "UX Researcher",
  "Data Analyst",
]

export function InviteMemberDialog() {
  const { actions } = useJkboard()
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<InviteValues>({
    name: "",
    email: "",
    role: roleOptions[2],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const result = inviteSchema.safeParse(values)

    if (!result.success) {
      const nextErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message
      }
      setErrors(nextErrors)
      return
    }

    try {
      await actions.inviteMember(result.data)

      toast.add({
        type: "success",
        title: "Invitation sent",
        description: `${result.data.name} will receive an email shortly.`,
      })

      setValues({ name: "", email: "", role: roleOptions[2] })
      setErrors({})
      setOpen(false)
    } catch (error) {
      toast.add({
        type: "error",
        title: "Invite failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="cursor-pointer" />}>
        <UserPlus data-icon="inline-start" />
        Invite teammate
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            They will get access to the shared boards and can be assigned work
            straight away.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="invite-name">Full name</FieldLabel>
              <Input
                id="invite-name"
                placeholder="Alex Rivera"
                value={values.name}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, name: event.target.value }))
                }
              />
              {errors.name && <FieldError errors={[{ message: errors.name }]} />}
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="invite-email">Work email</FieldLabel>
              <Input
                id="invite-email"
                type="email"
                placeholder="alex@jkboard.app"
                value={values.email}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, email: event.target.value }))
                }
              />
              {errors.email && <FieldError errors={[{ message: errors.email }]} />}
            </Field>

            <Field>
              <FieldLabel htmlFor="invite-role">Role</FieldLabel>
              <Select
                items={roleOptions.map((role) => ({
                  value: role,
                  label: role,
                }))}
                value={values.role}
                onValueChange={(value) =>
                  value && setValues((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger id="invite-role" className="w-full cursor-pointer">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" className="cursor-pointer">
              Send invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}