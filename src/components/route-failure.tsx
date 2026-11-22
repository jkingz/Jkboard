"use client"

import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { PageStatus } from "@/components/page-status"

export function RouteFailure({ retry, workspace = false }: { retry: () => void; workspace?: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <PageStatus
      code="500"
      title={workspace ? "This workspace page could not load" : "Something went wrong"}
      description="Try loading the page again. If the problem continues, return to Jkboard."
      inline={workspace}
    >
      <Button disabled={pending} onClick={() => startTransition(retry)}>
        {pending ? "Trying again…" : "Try again"}
      </Button>
    </PageStatus>
  )
}
