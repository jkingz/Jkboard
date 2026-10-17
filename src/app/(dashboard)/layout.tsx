import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardShell } from "./components/dashboard-shell"
import { WorkspaceAccessNotice } from "./components/workspace-access-notice"
import { getMemberByUserId, getWorkspaceData } from "@/db/queries/jkboard"
import { auth } from "@/lib/auth"

/**
 * Server layout: verifies the session, loads the workspace once per request and
 * hands both to the client shell. Nothing below this file imports the database
 * directly, and no client component ever sees the auth instance.
 *
 * Forced dynamic because the workspace is live data and the session is
 * per-request.
 */
export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The proxy only does an optimistic cookie check; the session is verified
  // here for real.
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/sign-in")
  }

  const [initialData, currentMember] = await Promise.all([
    getWorkspaceData(),
    // Whose identity this is, resolved from the session rather than from the
    // member list: `member_userId_uidx` makes it one row, and it is the same
    // read `requireMembership()` makes inside every action.
    getMemberByUserId(session.user.id),
  ])

  if (!currentMember) {
    return <WorkspaceAccessNotice email={session.user.email} />
  }

  return (
    <DashboardShell
      initialData={initialData}
      currentMember={currentMember}
      sessionUser={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
    >
      {children}
    </DashboardShell>
  )
}