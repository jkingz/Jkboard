import "server-only"

import { cache } from "react"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { getMemberByUserId as readMember, getWorkspaceData as readWorkspace } from "@/db/queries/jkboard"

// Share the authenticated workspace read between its layout and project page.
export const getWorkspaceSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
)
export const getMemberByUserId = cache(readMember)
export const getWorkspaceData = cache(readWorkspace)
