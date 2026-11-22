import { PageStatus } from "@/components/page-status"

export const metadata = { title: "Something went wrong", robots: { index: false } }

export default function StatusPage() {
  return (
    <PageStatus
      code="500"
      title="Something went wrong"
      description="Try opening Jkboard again in a moment."
      href="/landing"
      linkLabel="Back to Jkboard"
    />
  )
}
