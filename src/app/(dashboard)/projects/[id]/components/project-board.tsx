"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  FolderOpen,
  ListTodo,
  SquareKanban,
  TriangleAlert,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskDetailDialog } from "@/components/task-detail-dialog"
import { AddTaskModal } from "@/app/(dashboard)/tasks/components/add-task-modal"
import { ProjectDialog } from "@/components/project-dialog"
import { cn } from "@/lib/utils"
import { useJkboard } from "@/data/jkboard-store"
import {
  daysUntil,
  formatDate,
  formatShortDate,
  isOverdue,
  priorityClasses,
  priorityIcons,
  projectStatusClasses,
  projectStatuses,
  taskStatuses,
} from "@/data/jkboard"

export function ProjectBoard() {
  const params = useParams<{ id: string }>()
  const projectId = params?.id

  const { projectById, memberById, tasksForProject, projectProgress } =
    useJkboard()

  const [openTaskId, setOpenTaskId] = React.useState<string | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)

  const project = projectId ? projectById(projectId) : undefined

  if (!project) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
          <FolderOpen className="size-8 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Project not found</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            This project does not exist in the workspace, or it was deleted.
          </p>
          <Button
            className="mt-2 cursor-pointer"
            nativeButton={false}
            render={<Link href="/projects" />}
          >
            Back to projects
          </Button>
        </CardContent>
      </Card>
    )
  }

  const status = projectStatuses.find((entry) => entry.value === project.status)!
  const { completed, total, progress } = projectProgress(project.id)
  const projectTasks = tasksForProject(project.id)
  const targetOverdue = project.status !== "completed" && daysUntil(project.dueDate) < 0
  const overdueCount = projectTasks.filter(isOverdue).length

  return (
    <>
      <div className="flex min-w-0 flex-col gap-5 px-4 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{project.name}</h1>
            {project.description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{project.description}</p>}
          </div>
          <AddTaskModal defaultProjectId={project.id} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-muted px-4 py-3 text-sm">
          <Badge variant="outline" className={projectStatusClasses[project.status]}>
            <status.icon />
            {status.label}
          </Badge>
          <span className={cn("text-muted-foreground", targetOverdue && "text-destructive")}>
            Target <time dateTime={project.dueDate}>{formatShortDate(project.dueDate)}</time>
            {targetOverdue && " · Overdue"}
          </span>
          {overdueCount > 0 && <span className="text-destructive">{overdueCount} overdue {overdueCount === 1 ? "task" : "tasks"}</span>}
          <div className="flex items-center gap-2">
            <span>{completed} of {total} complete</span>
            <Progress value={progress} className="w-16" aria-label="Project completion" />
          </div>
          <AvatarGroup>
            {project.memberIds.map((id) => {
              const member = memberById(id)
              return member && (
                <Avatar key={id} size="sm" aria-label={member.name}>
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
              )
            })}
          </AvatarGroup>
        </div>

        <Tabs defaultValue="board" className="w-full">
          <div className="flex flex-wrap items-center gap-2">
            <TabsList variant="line">
              <TabsTrigger value="board" className="cursor-pointer">
                <SquareKanban /> Board
              </TabsTrigger>
              <TabsTrigger value="list" className="cursor-pointer">
                <ListTodo /> List
              </TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>Edit project</Button>
          </div>

          <TabsContent value="board" className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {taskStatuses.map((column) => {
                const columnTasks = projectTasks.filter(
                  (task) => task.status === column.value
                )

                return (
                  <Card key={column.value} size="sm" className="gap-3 bg-muted">
                    <CardHeader className="flex-row items-center justify-between">
                      <CardDescription className="flex items-center gap-1.5 text-xs font-medium">
                        <column.icon className="size-3.5" />
                        {column.label}
                      </CardDescription>
                      <Badge variant="secondary">{columnTasks.length}</Badge>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      {columnTasks.length === 0 ? (
                        <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                          Nothing here yet
                        </p>
                      ) : (
                        columnTasks.map((task) => {
                          const assignee = memberById(task.assigneeId)
                          const PriorityIcon = priorityIcons[task.priority]
                          const overdue = isOverdue(task)

                          return (
                            <button
                              key={task.id}
                              type="button"
                              onClick={() => setOpenTaskId(task.id)}
                              className="cursor-pointer rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            >
                              <p className="text-sm font-medium leading-snug">
                                {task.title}
                              </p>
                              <div className="mt-3 flex items-center justify-between gap-2">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "capitalize",
                                    priorityClasses[task.priority]
                                  )}
                                >
                                  <PriorityIcon />
                                  {task.priority}
                                </Badge>
                                <span
                                  className={cn(
                                    "flex items-center gap-1 text-xs tabular-nums",
                                    overdue
                                      ? "text-destructive"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {overdue && <TriangleAlert className="size-3" />}
                                  {formatDate(task.dueDate)}
                                </span>
                              </div>
                              {assignee && (
                                <div className="mt-3 flex items-center gap-2">
                                  <Avatar className="size-5">
                                    <AvatarFallback className="text-[9px]">
                                      {assignee.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate text-xs text-muted-foreground">
                                    {assignee.name}
                                  </span>
                                </div>
                              )}
                            </button>
                          )
                        })
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All project tasks</CardTitle>
                <CardDescription>
                  Sorted by due date. Select a row to see full details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...projectTasks]
                      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                      .map((task) => {
                        const taskStatus = taskStatuses.find(
                          (entry) => entry.value === task.status
                        )!
                        const assignee = memberById(task.assigneeId)
                        const PriorityIcon = priorityIcons[task.priority]
                        const overdue = isOverdue(task)

                        return (
                          <TableRow
                            key={task.id}
                            className="cursor-pointer"
                            onClick={() => setOpenTaskId(task.id)}
                          >
                            <TableCell className="max-w-[260px]">
                              <span className="block truncate font-medium">
                                {task.title}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1.5 text-sm">
                                <taskStatus.icon className="size-3.5 text-muted-foreground" />
                                {taskStatus.label}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "capitalize",
                                  priorityClasses[task.priority]
                                )}
                              >
                                <PriorityIcon />
                                {task.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {assignee?.name ?? "Unassigned"}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-sm tabular-nums",
                                overdue ? "text-destructive" : "text-muted-foreground"
                              )}
                            >
                              {formatDate(task.dueDate)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <TaskDetailDialog
        taskId={openTaskId}
        onOpenChange={(open) => !open && setOpenTaskId(null)}
      />

      <ProjectDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
      />
    </>
  )
}
