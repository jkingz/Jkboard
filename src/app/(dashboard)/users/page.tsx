"use client"

import { useJkboard } from "@/data/jkboard-store"
import { InviteMemberDialog } from "./components/invite-member-dialog"
import { TeamTable } from "./components/team-table"

export default function TeamPage() {
  const { members } = useJkboard()

  const activeCount = members.filter((m) => m.status === "Active").length
  const invitedCount = members.filter((m) => m.status === "Invited").length
  return (
    <div className="flex flex-col gap-6 px-4 md:px-6 @container/main">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See who owns the work and how much is open.
          </p>
        </div>
        <InviteMemberDialog />
      </div>

      <dl className="grid grid-cols-3 divide-x rounded-lg border bg-muted">
        {[
          { label: "Teammates", count: members.length },
          { label: "Active", count: activeCount },
          { label: invitedCount === 1 ? "Pending invite" : "Pending invites", count: invitedCount },
        ].map(({ label, count }) => (
          <div key={label} className="flex flex-col-reverse gap-0.5 px-3 py-3 sm:px-5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-xl font-semibold tabular-nums">{count}</dd>
          </div>
        ))}
      </dl>

      <TeamTable />
    </div>
  )
}