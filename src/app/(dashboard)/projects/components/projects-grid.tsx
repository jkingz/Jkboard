"use client"

import * as React from "react"
import Link from "next/link"
import {
  CalendarClock,
  EllipsisVertical,
  FolderKanban,
  ListTodo,
  Pencil,
  SquarePen,
  Trash2,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { useFlowBoard } from "@/data/flowboard-store"
import {
  daysUntil,
  formatDate,
  projectStatusClasses,
  projectStatuses,
  type Project,
} from "@/data/flowboard"
import { ProjectDialog } from "@/components/project-dialog"

export function ProjectsGrid() {
  const { projects, projectProgress, memberById, tasksForProject, actions } =
    useFlowBoard()

  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<string>("all")
  const [editProject, setEditProject] = React.useState<Project | null>(null)
  const [deleteProject, setDeleteProject] = React.useState<Project | null>(null)

  const filtered = projects.filter((project) => {
    const matchesStatus = status === "all" || project.status === status
    const needle = query.trim().toLowerCase()
    const matchesQuery =
      needle === "" ||
      project.name.toLowerCase().includes(needle) ||
      project.key.toLowerCase().includes(needle) ||
      project.description.toLowerCase().includes(needle)

    return matchesStatus && matchesQuery
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="sm:max-w-sm">
          <InputGroupInput
            placeholder="Search projects..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <InputGroupAddon>
            <FolderKanban />
          </InputGroupAddon>
        </InputGroup>

        <div className="flex items-center gap-2">
          <Select
            items={[
              { value: "all", label: "All statuses" },
              ...projectStatuses,
            ]}
            value={status}
            onValueChange={(value) => value && setStatus(value)}
          >
            <SelectTrigger className="w-44 cursor-pointer">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All statuses</SelectItem>
                {projectStatuses.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="size-4 text-muted-foreground" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <ProjectDialog />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <FolderKanban className="size-8 text-muted-foreground" />
            <p className="font-medium">No projects match your filters</p>
            <p className="text-sm text-muted-foreground">
              Try a different search term or clear the status filter.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 @3xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              progress={projectProgress(project.id)}
              memberNames={project.memberIds
                .map((id) => memberById(id))
                .filter(Boolean)
                .map((member) => member!.initials)}
              taskCount={tasksForProject(project.id).length}
              onEdit={() => setEditProject(project)}
              onDelete={() => setDeleteProject(project)}
              onComplete={() => {
                actions.setProjectStatus(project.id, "completed")
                toast.add({
                  type: "success",
                  title: "Project completed",
                  description: `${project.name} moved to completed.`,
                })
              }}
              onReopen={() => {
                actions.setProjectStatus(project.id, "active")
                toast.add({
                  type: "success",
                  title: "Project reopened",
                  description: `${project.name} is active again.`,
                })
              }}
            />
          ))}
        </div>
      )}

      <ProjectDialog
        key={editProject?.id}
        project={editProject ?? undefined}
        open={Boolean(editProject)}
        onOpenChange={(open) => !open && setEditProject(null)}
      />

      <Dialog
        open={Boolean(deleteProject)}
        onOpenChange={(open) => !open && setDeleteProject(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleteProject?.name}?</DialogTitle>
            <DialogDescription>
              This removes the project and its{" "}
              {deleteProject ? tasksForProject(deleteProject.id).length : 0}{" "}
              tasks. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setDeleteProject(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                if (deleteProject) {
                  const name = deleteProject.name
                  actions.deleteProject(deleteProject.id)
                  setDeleteProject(null)
                  toast.add({
                    type: "info",
                    title: "Project deleted",
                    description: `${name} and its tasks were removed.`,
                  })
                }
              }}
            >
              <Trash2 data-icon="inline-start" />
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ProjectCardProps {
  project: Project
  progress: { total: number; completed: number; progress: number }
  memberNames: string[]
  taskCount: number
  onEdit: () => void
  onDelete: () => void
  onComplete: () => void
  onReopen: () => void
}

function ProjectCard({
  project,
  progress,
  memberNames,
  taskCount,
  onEdit,
  onDelete,
  onComplete,
  onReopen,
}: ProjectCardProps) {
  const status = projectStatuses.find((entry) => entry.value === project.status)!
  const remaining = daysUntil(project.dueDate)
  const overdue = remaining < 0 && project.status !== "completed"

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: project.color }}
            aria-hidden="true"
          />
          <CardTitle className="truncate">
            <Link href={`/projects/${project.id}`} className="hover:underline">
              {project.name}
            </Link>
          </CardTitle>
        </div>
        <CardDescription className="line-clamp-2">
          {project.description || "No description yet."}
        </CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 cursor-pointer"
                />
              }
            >
              <EllipsisVertical />
              <span className="sr-only">Project actions for {project.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="cursor-pointer"
                  render={<Link href={`/projects/${project.id}`} />}
                >
                  <ListTodo />
                  Open board
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
                  <SquarePen />
                  Edit details
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {project.status === "completed" ? (
                  <DropdownMenuItem className="cursor-pointer" onClick={onReopen}>
                    <Pencil />
                    Reopen project
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="cursor-pointer" onClick={onComplete}>
                    <Pencil />
                    Mark completed
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={onDelete}
                >
                  <Trash2 />
                  Delete project
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <Badge
          variant="outline"
          className={cn("w-fit", projectStatusClasses[project.status])}
        >
          <status.icon />
          {status.label}
        </Badge>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {progress.completed} of {progress.total} tasks complete
            </span>
            <span className="tabular-nums">{progress.progress}%</span>
          </div>
          <Progress value={progress.progress} />
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-2">
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs",
            overdue ? "text-destructive" : "text-muted-foreground"
          )}
        >
          <CalendarClock className="size-3.5" />
          {overdue
            ? `Overdue by ${Math.abs(remaining)}d`
            : `Due ${formatDate(project.dueDate)}`}
        </span>
        <span className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ListTodo className="size-3.5" />
            {taskCount}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {memberNames.length}
          </span>
          <AvatarGroup>
            {memberNames.slice(0, 3).map((initials) => (
              <Avatar key={initials} size="sm" className="size-6">
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </span>
      </CardFooter>
    </Card>
  )
}