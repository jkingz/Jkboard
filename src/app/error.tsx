"use client"

import { RouteFailure } from "@/components/route-failure"

export default function ErrorPage({ retry }: { retry: () => void }) {
  return <RouteFailure retry={retry} />
}
