"use client"

import { ProjectsGrid } from "./components/projects-grid"
import { useFlowBoard } from "@/data/flowboard-store"

export default function ProjectsPage() {
  const { projects } = useFlowBoard()
  const activeCount = projects.filter(
    (project) => project.status === "active"
  ).length

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            {activeCount} active of {projects.length} projects. Track scope,
            owners and progress in one place.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col @container/main px-4 lg:px-6">
        <ProjectsGrid />
      </div>
    </>
  )
}