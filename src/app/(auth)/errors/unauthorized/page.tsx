import { PageStatus } from "@/components/page-status"

export const metadata = { title: "Sign in to continue", robots: { index: false } }

export default function StatusPage() {
  return (
    <PageStatus
      code="401"
      title="Sign in to continue"
      description="Use your Jkboard account to open the workspace."
      href="/sign-in"
      linkLabel="Sign in"
    />
  )
}
