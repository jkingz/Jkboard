"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { toast } from "@/components/ui/toast"

export interface EmailPasswordValues {
  email: string
  password: string
  /** Only used when signing up. */
  name?: string
}

/** Better Auth error codes -> something a person can act on. */
const errorMessages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "That email and password combination is not correct.",
  USER_NOT_FOUND: "No account exists for that email address.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "An account already exists for that email.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
  INVALID_EMAIL: "Enter a valid email address.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "That account uses another sign-in method.",
  SOCIAL_ACCOUNT_NOT_LINKED: "That account uses another sign-in method.",
}

function describe(error: { code?: string; message?: string } | null) {
  if (!error) return "Something went wrong. Please try again."
  if (error.code && errorMessages[error.code]) return errorMessages[error.code]
  return error.message || "Something went wrong. Please try again."
}

/**
 * Shared sign-in / sign-up logic.
 *
 * Every auth form on the site calls this, so the six page variants share one
 * implementation instead of six near-identical copies.
 */
export function useEmailPasswordAuth() {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  const [error, setError] = React.useState<string | null>(null)

  const fail = React.useCallback((message: string) => {
    setError(message)
    toast.add({
      type: "error",
      title: "Check the form",
      description: message,
    })
  }, [])

  const submit = React.useCallback(
    (
      mode: "sign-in" | "sign-up",
      values: EmailPasswordValues,
      redirectTo = "/dashboard"
    ) => {
      startTransition(async () => {
        setError(null)

        const result =
          mode === "sign-up"
            ? await authClient.signUp.email({
                email: values.email,
                password: values.password,
                name: values.name?.trim() || values.email.split("@")[0],
              })
            : await authClient.signIn.email({
                email: values.email,
                password: values.password,
              })

        if (result.error) {
          const message = describe(result.error)
          setError(message)
          toast.add({
            type: "error",
            title:
              mode === "sign-up" ? "Could not create account" : "Sign-in failed",
            description: message,
          })
          return
        }

        toast.add({
          type: "success",
          title: mode === "sign-up" ? "Account created" : "Welcome back",
          description:
            mode === "sign-up"
              ? "Your FlowBoard workspace is ready."
              : "You are signed in.",
        })

        router.replace(redirectTo)
        router.refresh()
      })
    },
    [router]
  )

  /** Reads email/password straight off a plain (uncontrolled) form element. */
  const submitFromForm = React.useCallback(
    (
      event: React.FormEvent<HTMLFormElement>,
      mode: "sign-in" | "sign-up",
      name?: string,
      redirectTo?: string
    ) => {
      event.preventDefault()
      const data = new FormData(event.currentTarget)
      const email = String(data.get("email") ?? "").trim()
      const password = String(data.get("password") ?? "")
      const confirm = String(data.get("confirmPassword") ?? "")

      if (mode === "sign-up") {
        if (password.length < 8) {
          fail("Password must be at least 8 characters.")
          return
        }
        if (confirm && confirm !== password) {
          fail("Passwords don't match")
          return
        }
      }

      const fullName = [data.get("firstName"), data.get("lastName")]
        .map((part) => String(part ?? "").trim())
        .filter(Boolean)
        .join(" ")

      submit(mode, { email, password, name: name || fullName || undefined }, redirectTo)
    },
    [submit, fail]
  )

  return { submit, submitFromForm, pending, error, setError }
}
