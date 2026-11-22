"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { isOverdue } from "@/data/jkboard"
import { TaskDetailDialog } from "@/components/task-detail-dialog"
import { toast } from "@/components/ui/toast"
import { useJkboard } from "@/data/jkboard-store"
import { buildTaskColumns } from "./components/columns"
import { DataTable } from "./components/data-table"

import { AddTaskModal } from "./components/add-task-modal"

const INSPECTOR_QUERY = "(min-width: 64rem)"

function subscribeToInspector(onChange: () => void) {
  const media = window.matchMedia(INSPECTOR_QUERY)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

export default function TasksPage() {
  const { tasks, projects, members, taskStats, taskById, actions } = useJkboard()
  const searchParams = useSearchParams()
  const overdueOnly = searchParams.get("due") === "overdue"
  const openTaskId = searchParams.get("task")
  const wide = React.useSyncExternalStore(
    subscribeToInspector,
    () => window.matchMedia(INSPECTOR_QUERY).matches,
    () => false
  )
  const showInspector = wide && Boolean(openTaskId && taskById(openTaskId))
  const visibleTasks = overdueOnly
    ? tasks.filter(isOverdue).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    : tasks

  const setOpenTaskId = React.useCallback((taskId: string | null) => {
    const url = new URL(window.location.href)
    if (taskId) url.searchParams.set("task", taskId)
    else url.searchParams.delete("task")
    window.history.replaceState(null, "", url)
  }, [])

  const columns = React.useMemo(
    () =>
      buildTaskColumns({
        projects,
        members,
        onViewTask: setOpenTaskId,
        onDuplicateTask: async (taskId) => {
          const copy = await actions.duplicateTask(taskId)
          if (copy) {
            toast.add({
              type: "success",
              title: "Task duplicated",
              description: `${copy.title} was added as a new task.`,
            })
          }
        },
        onDeleteTask: async (taskId) => {
          await actions.deleteTask(taskId)
          toast.add({
            type: "info",
            title: "Task deleted",
            description: `${taskId} was removed from the workspace.`,
          })
        },
      }),
    [projects, members, actions, setOpenTaskId]
  )

  return (
    <div className="flex min-w-0 flex-col gap-4 px-4 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {taskStats.total} total · {taskStats.active} open · {taskStats.completed} complete
          </p>
        </div>
        <AddTaskModal />
      </div>

      <nav aria-label="Task views" className="workspace-view-tabs flex flex-wrap gap-1 border-b">
        <Link
          href="/tasks"
          className="workspace-view-tab"
          aria-current={overdueOnly ? undefined : "page"}
        >
          All tasks
        </Link>
        <Link
          href="/tasks?due=overdue"
          className="workspace-view-tab"
          aria-current={overdueOnly ? "page" : undefined}
        >
          Overdue ({taskStats.overdue})
        </Link>
      </nav>
      <div className={cn("grid min-w-0 items-start gap-4", showInspector && "lg:grid-cols-[minmax(0,1fr)_minmax(17rem,21rem)]")}>
        <DataTable data={visibleTasks} columns={columns} activeTaskId={openTaskId} compact={showInspector} />
        <TaskDetailDialog
          taskId={openTaskId}
          inline={showInspector}
          onOpenChange={(open) => !open && setOpenTaskId(null)}
        />
      </div>
    </div>
  )
}