"use client"

import { RouteFailure } from "@/components/route-failure"

export default function WorkspaceError({ retry }: { retry: () => void }) {
  return <RouteFailure retry={retry} workspace />
}
