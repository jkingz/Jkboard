"use client"

import { ProjectsTable } from "./components/projects-table"
import { ProjectDialog } from "@/components/project-dialog"
import { useJkboard } from "@/data/jkboard-store"

export default function ProjectsPage() {
  const { projects } = useJkboard()
  const activeCount = projects.filter(
    (project) => project.status === "active"
  ).length

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeCount} active of {projects.length} projects in this workspace.
            </p>
          </div>
          <ProjectDialog />
        </div>
      </div>

      <div className="flex flex-1 flex-col @container/main px-4 lg:px-6">
        <ProjectsTable />
      </div>
    </>
  )
}
