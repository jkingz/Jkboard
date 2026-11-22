import { PageStatus } from "@/components/page-status"

export const metadata = { title: "Access restricted", robots: { index: false } }

export default function StatusPage() {
  return (
    <PageStatus
      code="403"
      title="Access restricted"
      description="Ask the person who manages your workspace to check your access."
      href="/dashboard"
      linkLabel="Go to workspace"
    />
  )
}
