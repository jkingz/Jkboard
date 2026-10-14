"use client"

import * as React from "react"
import Link from "next/link"
import { UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useFlowBoard } from "@/data/flowboard-store"

export function SidebarNotification() {
  const [isVisible, setIsVisible] = React.useState(true)
  const { members } = useFlowBoard()

  const pending = members.filter((member) => member.status === "Invited").length

  if (!isVisible || pending === 0) return null

  return (
    <Card className="mb-3 py-0 bg-muted/50 shadow-sm">
      <CardContent className="p-4 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 size-6 p-0"
          onClick={() => setIsVisible(false)}
        >
          <X />
          <span className="sr-only">Close notification</span>
        </Button>

        <div className="pr-6">
          <h3 className="mb-2 mt-1 flex items-center gap-2 font-semibold">
            <UserPlus className="size-4 text-primary" />
            {pending} pending invite{pending === 1 ? "" : "s"}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Teammates are waiting to join the workspace.{" "}
            <Link href="/users" className="text-primary underline">
              Manage the team
            </Link>{" "}
            or resend their invitation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}