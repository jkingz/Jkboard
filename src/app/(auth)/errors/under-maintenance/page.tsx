import { PageStatus } from "@/components/page-status"

export const metadata = { title: "Jkboard is unavailable", robots: { index: false } }

export default function StatusPage() {
  return (
    <PageStatus
      code="503"
      title="Jkboard is unavailable"
      description="Please check back later."
      href="/landing"
      linkLabel="Back to Jkboard"
    />
  )
}
