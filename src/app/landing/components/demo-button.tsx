"use client"

import Link from "next/link"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useEmailPasswordAuth } from "@/hooks/use-email-password"
import { useSession } from "@/lib/auth-client"
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_REDIRECT_TO } from "@/lib/demo"

/**
 * One click into the shared demo: signs in as the demo user and lands on the
 * dashboard. A visitor who is already signed in just goes to their workspace,
 * so we never swap their session for the demo one.
 */
export function DemoButton({
  className,
  size = "lg",
  variant = "default",
}: {
  className?: string
  size?: "default" | "lg"
  variant?: "default" | "outline"
}) {
  const { submit, pending } = useEmailPasswordAuth()
  const signedIn = useSession().data != null

  if (signedIn) {
    return (
      <Button
        size={size}
        variant={variant}
        className={className}
        nativeButton={false}
        render={<Link href="/dashboard" />}
      >
        Open your workspace
      </Button>
    )
  }

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      disabled={pending}
      onClick={() =>
        submit("sign-in", { email: DEMO_EMAIL, password: DEMO_PASSWORD }, DEMO_REDIRECT_TO)
      }
    >
      {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
      {pending ? "Opening the demo…" : "Open the live demo"}
    </Button>
  )
}
