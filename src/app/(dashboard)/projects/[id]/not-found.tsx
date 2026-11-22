import { PageStatus } from "@/components/page-status"

export default function ProjectNotFound() {
  return (
    <PageStatus
      code="404"
      title="Project not found"
      description="This project is unavailable. Browse your workspace to find another project."
      href="/projects"
      linkLabel="Browse projects"
      inline
    />
  )
}
