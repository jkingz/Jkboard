import { PageStatus } from "@/components/page-status"

export default function NotFound() {
  return (
    <PageStatus
      code="404"
      title="Page not found"
      description="This link may have changed. Return to Jkboard to find your workspace or sign in."
    />
  )
}
