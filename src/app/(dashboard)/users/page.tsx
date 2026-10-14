"use client"

import { CheckCircle2, Clock, ListTodo, UserCheck, Users } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { useFlowBoard } from "@/data/flowboard-store"
import { InviteMemberDialog } from "./components/invite-member-dialog"
import { TeamTable } from "./components/team-table"

export default function TeamPage() {
  const { members, workloadFor } = useFlowBoard()

  const activeCount = members.filter((m) => m.status === "Active").length
  const invitedCount = members.filter((m) => m.status === "Invited").length
  const openTasks = members.reduce(
    (total, member) => total + workloadFor(member.id).assigned,
    0
  )

  const stats = [
    { label: "Teammates", value: members.length, icon: Users },
    { label: "Active now", value: activeCount, icon: UserCheck },
    { label: "Pending invites", value: invitedCount, icon: Clock },
    { label: "Open tasks assigned", value: openTasks, icon: ListTodo },
  ]

  return (
    <div className="flex flex-col gap-6 px-4 md:px-6 @container/main">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Who is on the workspace, what they own, and how loaded they are.
          </p>
        </div>
        <InviteMemberDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="@container/card">
            <CardContent className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
                <span className="text-2xl font-bold tabular-nums">
                  {stat.value}
                </span>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <stat.icon className="size-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <AvatarGroup>
                {members.map((member) => (
                  <Avatar key={member.id} className="size-8">
                    <AvatarFallback className="text-xs">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <p className="text-sm text-muted-foreground">
                {activeCount} of {members.length} teammates active
                {invitedCount > 0 && `, ${invitedCount} invite pending`}.
              </p>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-success" />
              Workload bars are calculated from open tasks assigned in this
              workspace.
            </p>
          </div>
        </CardContent>
      </Card>

      <TeamTable />
    </div>
  )
}