import { notFound } from "next/navigation"

import { getMemberByUserId, getWorkspaceData, getWorkspaceSession } from "../../workspace-request"
import { ProjectBoard } from "./components/project-board"

export const metadata = {
  title: "Project board",
  description: "Kanban board and task list for a Jkboard project.",
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getWorkspaceSession()
  // The workspace layout supplies the sign-in or access screen for these cases.
  if (!session || !await getMemberByUserId(session.user.id)) return null

  const [{ id }, { projects }] = await Promise.all([params, getWorkspaceData()])
  if (!projects.some((project) => project.id === id)) notFound()

  return <ProjectBoard />
}
