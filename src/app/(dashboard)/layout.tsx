import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardShell } from "./components/dashboard-shell"
import { getWorkspaceData } from "@/db/queries/flowboard"
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

  const initialData = await getWorkspaceData()

  return (
    <DashboardShell
      initialData={initialData}
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