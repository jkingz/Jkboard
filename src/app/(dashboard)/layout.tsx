import { Suspense } from "react"
import { redirect } from "next/navigation"

import { DashboardShell } from "./components/dashboard-shell"
import { WorkspaceAccessNotice } from "./components/workspace-access-notice"
import { getMemberByUserId, getWorkspaceData, getWorkspaceSession } from "./workspace-request"
import { WorkspaceSkeleton } from "./components/workspace-skeleton"

/**
 * Server layout: verifies the session, loads the workspace once per request and
 * hands both to the client shell. Nothing below this file imports the database
 * directly, and no client component ever sees the auth instance.
 *
 * Forced dynamic because the workspace is live data and the session is
 * per-request.
 */
export const dynamic = "force-dynamic"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <WorkspaceGate>{children}</WorkspaceGate>
    </Suspense>
  )
}

async function WorkspaceGate({ children }: { children: React.ReactNode }) {
  // The proxy only does an optimistic cookie check; the session is verified
  // here for real.
  const session = await getWorkspaceSession()

  if (!session) {
    redirect("/sign-in")
  }

  const currentMember = await getMemberByUserId(session.user.id)
  if (!currentMember) {
    return <WorkspaceAccessNotice email={session.user.email} />
  }

  const initialData = await getWorkspaceData()

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