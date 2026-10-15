"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { toast } from "@/components/ui/toast"
import { errorMessage } from "@/lib/error-message"

import {
  createProjectAction,
  deleteProjectAction,
  setProjectStatusAction,
  updateProjectAction,
} from "@/db/actions/projects"
import {
  createTaskAction,
  deleteTaskAction,
  duplicateTaskAction,
  setTaskStatusAction,
  updateTaskAction,
} from "@/db/actions/tasks"
import {
  inviteMemberAction,
  removeMemberAction,
  setMemberStatusAction,
} from "@/db/actions/members"
import type { WorkspaceData } from "@/db/queries/jkboard"
import {
  getProjectProgress,
  getTaskStats,
  getWorkload,
  type Member,
  type Project,
  type ProjectProgress,
  type Task,
  type TaskStats,
} from "./jkboard"

/**
 * Client-side view of the workspace.
 *
 * The server layout loads the rows once and passes them in as `initialData`.
 * Mutations call server actions and then update local state, so the UI stays
 * responsive while PostgreSQL stays the source of truth.
 *
 * The database itself is never imported here.
 */

export interface ProjectInput {
  name: string
  key: string
  description?: string
  status: Project["status"]
  dueDate: string
  startDate?: string
  color: string
  memberIds: string[]
}

export interface TaskInput {
  projectId: string
  title: string
  description?: string
  status: Task["status"]
  priority: Task["priority"]
  assigneeId: string
  dueDate: string
}

export interface InviteInput {
  name: string
  email: string
  role: string
}

export interface JkboardActions {
  createProject: (project: ProjectInput) => Promise<Project>
  updateProject: (projectId: string, patch: Partial<ProjectInput>) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  setProjectStatus: (projectId: string, status: Project["status"]) => Promise<void>

  createTask: (task: TaskInput) => Promise<Task>
  updateTask: (taskId: string, patch: Partial<TaskInput>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  duplicateTask: (taskId: string) => Promise<Task | undefined>
  setTaskStatus: (taskId: string, status: Task["status"]) => Promise<void>

  inviteMember: (member: InviteInput) => Promise<void>
  setMemberStatus: (memberId: string, status: Member["status"]) => Promise<void>
  removeMember: (memberId: string) => Promise<void>
}

interface JkboardContextValue {
  projects: Project[]
  tasks: Task[]
  members: Member[]
  currentMember: Member
  taskStats: TaskStats
  actions: JkboardActions

  projectById: (projectId: string) => Project | undefined
  memberById: (memberId: string) => Member | undefined
  taskById: (taskId: string) => Task | undefined
  tasksForProject: (projectId: string) => Task[]
  projectProgress: (projectId: string) => ProjectProgress
  workloadFor: (memberId: string) => { assigned: number; completed: number }
  projectsForMember: (memberId: string) => Project[]
}

const JkboardContext = React.createContext<JkboardContextValue | null>(null)

/**
 * Every mutation funnels its failure through here.
 *
 * Errors are toasted in the store rather than at each of the ~30 call sites,
 * because a call site that forgets its `catch` currently produces an unhandled
 * rejection and a silent failure. Success toasts stay at the call sites —
 * they need the created row's name, which only the caller has.
 *
 * Returns the sanitised error so the caller can still `throw` it: existing
 * `catch` blocks keep working unchanged.
 */
function fail(error: unknown, fallback: string) {
  const message = errorMessage(error, fallback)
  toast.add({ type: "error", title: message, description: fallback })
  return new Error(message)
}

export function JkboardProvider({
  initialData,
  children,
}: {
  initialData: WorkspaceData
  children: React.ReactNode
}) {
  const router = useRouter()
  const [projects, setProjects] = React.useState(initialData.projects)
  const [tasks, setTasks] = React.useState(initialData.tasks)
  const [members, setMembers] = React.useState(initialData.members)
  const [syncedFrom, setSyncedFrom] = React.useState(initialData)

  // Adopt fresh server data during render (React's "adjust state on prop
  // change" pattern) rather than in an effect, which would cause a cascading
  // re-render every time the layout revalidates after a mutation.
  if (initialData !== syncedFrom) {
    setSyncedFrom(initialData)
    setProjects(initialData.projects)
    setTasks(initialData.tasks)
    setMembers(initialData.members)
  }

  const actions = React.useMemo<JkboardActions>(
    () => ({
      async createProject(input) {
        try {
          const created = await createProjectAction({
            ...input,
            description: input.description ?? "",
          })
          setProjects((prev) => [created, ...prev])
          return created
        } catch (error) {
          throw fail(error, "Could not create the project.")
        } finally {
          router.refresh()
        }
      },

      async updateProject(projectId, patch) {
        const previous = projects
        try {
          const updated = await updateProjectAction(projectId, patch)
          setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)))
        } catch (error) {
          setProjects(previous)
          throw fail(error, "Could not update the project.")
        } finally {
          router.refresh()
        }
      },

      async deleteProject(projectId) {
        const previous = projects
        setProjects((prev) => prev.filter((p) => p.id !== projectId))
        setTasks((prev) => prev.filter((t) => t.projectId !== projectId))
        try {
          await deleteProjectAction(projectId)
        } catch (error) {
          setProjects(previous)
          throw fail(error, "Could not delete the project.")
        } finally {
          router.refresh()
        }
      },

      async setProjectStatus(projectId, status) {
        const previous = projects
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, status } : p))
        )
        try {
          await setProjectStatusAction(projectId, status)
        } catch (error) {
          setProjects(previous)
          throw fail(error, "Could not change the project status.")
        } finally {
          router.refresh()
        }
      },

      async createTask(input) {
        try {
          const created = await createTaskAction({
            ...input,
            description: input.description ?? "",
            assigneeId: input.assigneeId || null,
          })
          setTasks((prev) => [created, ...prev])
          return created
        } catch (error) {
          throw fail(error, "Could not create the task.")
        } finally {
          router.refresh()
        }
      },

      async updateTask(taskId, patch) {
        try {
          const updated = await updateTaskAction(taskId, {
            ...patch,
            assigneeId:
              patch.assigneeId === undefined
                ? undefined
                : patch.assigneeId || null,
          })
          setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
        } catch (error) {
          throw fail(error, "Could not update the task.")
        } finally {
          router.refresh()
        }
      },

      async deleteTask(taskId) {
        const previous = tasks
        setTasks((prev) => prev.filter((t) => t.id !== taskId))
        try {
          await deleteTaskAction(taskId)
        } catch (error) {
          setTasks(previous)
          throw fail(error, "Could not delete the task.")
        } finally {
          router.refresh()
        }
      },

      async duplicateTask(taskId) {
        try {
          const copy = await duplicateTaskAction(taskId)
          if (copy) setTasks((prev) => [copy, ...prev])
          return copy
        } catch (error) {
          throw fail(error, "Could not duplicate the task.")
        } finally {
          router.refresh()
        }
      },

      async setTaskStatus(taskId, status) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status } : t))
        )
        try {
          const updated = await setTaskStatusAction(taskId, status)
          setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
        } catch (error) {
          throw fail(error, "Could not change the status.")
        } finally {
          router.refresh()
        }
      },

      async inviteMember(input) {
        try {
          await inviteMemberAction(input)
        } catch (error) {
          throw fail(error, "Could not send the invite.")
        } finally {
          router.refresh()
        }
      },

      async setMemberStatus(memberId, status) {
        try {
          const updated = await setMemberStatusAction(memberId, status)
          setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)))
        } catch (error) {
          throw fail(error, "Could not update the member.")
        } finally {
          router.refresh()
        }
      },

      async removeMember(memberId) {
        const previous = members
        setMembers((prev) => prev.filter((m) => m.id !== memberId))
        try {
          await removeMemberAction(memberId)
        } catch (error) {
          setMembers(previous)
          throw fail(error, "Could not remove the member.")
        } finally {
          router.refresh()
        }
      },
    }),
    [projects, tasks, members, router]
  )

  const value = React.useMemo<JkboardContextValue>(
    () => ({
      projects,
      tasks,
      members,
      currentMember: members[0],
      taskStats: getTaskStats(tasks),
      actions,

      projectById: (projectId) =>
        projects.find((project) => project.id === projectId),
      memberById: (memberId) =>
        members.find((member) => member.id === memberId),
      taskById: (taskId) => tasks.find((task) => task.id === taskId),
      tasksForProject: (projectId) =>
        tasks.filter((task) => task.projectId === projectId),
      projectProgress: (projectId) =>
        getProjectProgress(projectId, tasks),
      workloadFor: (memberId) => getWorkload(memberId, tasks),
      projectsForMember: (memberId) =>
        projects.filter((project) => project.memberIds.includes(memberId)),
    }),
    [projects, tasks, members, actions]
  )

  return (
    <JkboardContext.Provider value={value}>{children}</JkboardContext.Provider>
  )
}

export function useJkboard() {
  const context = React.useContext(JkboardContext)

  if (!context) {
    throw new Error("useJkboard must be used inside <JkboardProvider>")
  }

  return context
}