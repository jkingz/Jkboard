"use client"

import { Loader2 } from "lucide-react"
import * as React from "react"

import { Button, type buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"

type Props = React.ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants> & {
    /** True while the action this button triggers is in flight. */
    pending?: boolean
    /**
     * Text shown while pending. Defaults to the children, so the button keeps
     * its width and the label does not jump.
     */
    pendingText?: string
  }

/**
 * A `Button` that cannot be pressed twice.
 *
 * Every mutation in this app is a server action with no idempotency key, so a
 * second click while the first is in flight creates a duplicate row. This
 * disables the button and swaps in a spinner for the duration.
 *
 * Pair it with `useTransition` in the caller so React keeps the surrounding UI
 * responsive while the action resolves:
 *
 *   const [pending, startTransition] = React.useTransition()
 *   <AsyncButton pending={pending} onClick={() => startTransition(async () => { ... })}>
 */
export function AsyncButton({
  pending = false,
  pendingText,
  className,
  children,
  disabled,
  onClick,
  ...props
}: Props) {
  return (
    <Button
      data-pending={pending || undefined}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cn(className)}
      onClick={onClick}
      {...props}
    >
      {pending ? (
        <Loader2
          data-icon="inline-start"
          className="animate-spin"
          aria-hidden="true"
        />
      ) : null}
      {pending && pendingText ? pendingText : children}
    </Button>
  )
}