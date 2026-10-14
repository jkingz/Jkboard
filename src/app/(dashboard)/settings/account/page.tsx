"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Trash2 } from "lucide-react"

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"
import { useJkboard } from "@/data/jkboard-store"

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[A-Z]/, "Include an uppercase letter.")
      .regex(/[0-9]/, "Include a number."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function SecuritySettings() {
  const { currentMember } = useJkboard()
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })
  const [deleteOpen, setDeleteOpen] = useState(false)

  function onSubmit() {
    toast.add({
      type: "success",
      title: "Password updated",
      description: "Use your new password the next time you sign in.",
    })
    form.reset()
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Security</h1>
        <p className="text-muted-foreground">
          Manage your password and the sign-in details for {currentMember.email}.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>
              Use at least 8 characters with an uppercase letter and a number.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Controller
              control={form.control}
              name="currentPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="security-current-password">
                    Current password
                  </FieldLabel>
                  <Input
                    id="security-current-password"
                    aria-invalid={fieldState.invalid}
                    type="password"
                    placeholder="Enter current password"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="security-new-password">
                    New password
                  </FieldLabel>
                  <Input
                    id="security-new-password"
                    aria-invalid={fieldState.invalid}
                    type="password"
                    placeholder="Enter new password"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="security-confirm-password">
                    Confirm new password
                  </FieldLabel>
                  <Input
                    id="security-confirm-password"
                    aria-invalid={fieldState.invalid}
                    type="password"
                    placeholder="Confirm new password"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Two-factor authentication</CardTitle>
            <CardDescription>
              Ask for a one-time code from your authenticator app at sign-in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() =>
                toast.add({
                  type: "info",
                  title: "Two-factor authentication",
                  description:
                    "Setup becomes available once an identity provider is connected.",
                })
              }
            >
              Set up two-factor
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Separator />
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div>
                <h4 className="font-semibold">Delete account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and every project you own.
                </p>
              </div>
              <Button
                variant="destructive"
                type="button"
                className="cursor-pointer"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 data-icon="inline-start" />
                Delete account
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" className="cursor-pointer">
            Update password
          </Button>
          <Button
            variant="outline"
            type="reset"
            className="cursor-pointer"
            onClick={() => form.reset()}
          >
            Cancel
          </Button>
        </div>
      </form>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently removes {currentMember.email}, every project you
              own and all tasks assigned to you. It cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setDeleteOpen(false)}
            >
              Keep my account
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                setDeleteOpen(false)
                toast.add({
                  type: "info",
                  title: "Deletion requested",
                  description:
                    "An email confirmation would be sent once accounts are enabled.",
                })
              }}
            >
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
