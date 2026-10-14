"use client"

import * as React from "react"
import {
  CalendarClock,
  CircleCheck,
  CircleDot,
  ListTodo,
  TriangleAlert,
} from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TaskDetailDialog } from "@/components/task-detail-dialog"
import { toast } from "@/components/ui/toast"
import { useJkboard } from "@/data/jkboard-store"
import { buildTaskColumns } from "./components/columns"
import { DataTable } from "./components/data-table"

const statDefinitions = [
  { key: "total", title: "Total Tasks", icon: ListTodo, hint: "Across every project" },
  { key: "active", title: "Active", icon: CircleDot, hint: "Not completed yet" },
  { key: "completed", title: "Completed", icon: CircleCheck, hint: "Finished to date" },
  { key: "overdue", title: "Overdue", icon: TriangleAlert, hint: "Past the due date" },
] as const

export default function TasksPage() {
  const { tasks, projects, members, taskStats, actions } = useJkboard()
  const [openTaskId, setOpenTaskId] = React.useState<string | null>(null)

  const columns = React.useMemo(
    () =>
      buildTaskColumns({
        projects,
        members,
        onViewTask: setOpenTaskId,
        onDuplicateTask: async (taskId) => {
          try {
            const copy = await actions.duplicateTask(taskId)
            if (copy) {
              toast.add({
                type: "success",
                title: "Task duplicated",
                description: `${copy.title} was added as a new task.`,
              })
            }
          } catch (error) {
            toast.add({
              type: "error",
              title: "Could not duplicate",
              description:
                error instanceof Error ? error.message : "Please try again.",
            })
          }
        },
        onDeleteTask: async (taskId) => {
          try {
            await actions.deleteTask(taskId)
            toast.add({
              type: "info",
              title: "Task deleted",
              description: `${taskId} was removed from the workspace.`,
            })
          } catch (error) {
            toast.add({
              type: "error",
              title: "Could not delete",
              description:
                error instanceof Error ? error.message : "Please try again.",
            })
          }
        },
      }),
    [projects, members, actions]
  )

  return (
    <>
      <div className="flex flex-col gap-2 px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">
          Every task across the workspace, with status, priority and due date.
        </p>
      </div>

      <div className="flex flex-col gap-6 px-4 md:px-6 @container/main">
        <div className="grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
          {statDefinitions.map((stat) => (
            <Card key={stat.key} className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <stat.icon className="size-4" />
                  {stat.title}
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {taskStats[stat.key]}
                </CardTitle>
                <CardAction>
                  <Badge
                    variant="outline"
                    className={
                      stat.key === "overdue" && taskStats.overdue > 0
                        ? "border-destructive/40 text-destructive"
                        : undefined
                    }
                  >
                    {stat.key === "overdue" && taskStats.overdue > 0 ? (
                      <TriangleAlert />
                    ) : (
                      <CalendarClock />
                    )}
                    {stat.hint}
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All tasks</CardTitle>
            <CardDescription>
              Filter by status, project or priority, then add new work inline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={tasks} columns={columns} />
          </CardContent>
        </Card>
      </div>

      <TaskDetailDialog
        taskId={openTaskId}
        onOpenChange={(open) => !open && setOpenTaskId(null)}
      />
    </>
  )
}