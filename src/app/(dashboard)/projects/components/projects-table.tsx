"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  EllipsisVertical,
  FolderKanban,
  ListTodo,
  Pencil,
  SquarePen,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { useJkboard } from "@/data/jkboard-store"
import {
  daysUntil,
  formatShortDate,
  projectStatusClasses,
  getProjectStatus,
  projectStatuses,
  type Project,
} from "@/data/jkboard"
import { ProjectDialog } from "@/components/project-dialog"

export function ProjectsTable() {
  const { projects, projectProgress, tasksForProject, actions } =
    useJkboard()

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
    <div className="flex flex-col gap-4">
      <div className="flex w-full flex-wrap gap-1 border-b" role="group" aria-label="Project views">
        {[
          { value: "all", label: "All projects", count: projects.length },
          { value: "active", label: "Active", count: projects.filter((project) => project.status === "active").length },
          { value: "completed", label: "Completed", count: projects.filter((project) => project.status === "completed").length },
        ].map((view) => (
          <button
            type="button"
            key={view.value}
            className="workspace-view-tab"
            aria-pressed={status === view.value}
            onClick={() => setStatus(view.value)}
          >
            {view.label} <span className="tabular-nums">{view.count}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="sm:max-w-sm">
          <InputGroupInput
            placeholder="Search projects"
            aria-label="Search projects"
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
        </div>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Task progress</TableHead>
              <TableHead>Target date</TableHead>
              <TableHead><span className="sr-only">Board and actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No projects match your filters.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                progress={projectProgress(project.id)}
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
          </TableBody>
        </Table>
      </div>

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

interface ProjectRowProps {
  project: Project
  progress: { total: number; completed: number; progress: number }
  onEdit: () => void
  onDelete: () => void
  onComplete: () => void
  onReopen: () => void
}

function ProjectRow({ project, progress, onEdit, onDelete, onComplete, onReopen }: ProjectRowProps) {
  const status = getProjectStatus(project.status)
  const overdue = daysUntil(project.dueDate) < 0 && project.status !== "completed"
  const href = `/projects/${project.id}`

  return (
    <TableRow>
      <TableCell className="min-w-36 pl-4 whitespace-normal">
        <Link href={href} className="font-medium hover:underline">{project.name}</Link>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={projectStatusClasses[project.status]}>
          <status.icon />
          {status.label}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex min-w-20 items-center gap-2 text-xs tabular-nums">
          <Progress className="hidden flex-1 sm:block" value={progress.progress} aria-label={`Task completion for ${project.name}`} />
          {progress.completed}/{progress.total}
        </div>
      </TableCell>
      <TableCell className={cn("font-medium tabular-nums", overdue && "text-destructive")}>
        <time dateTime={project.dueDate}>{formatShortDate(project.dueDate)}</time>
        {overdue && <span className="ml-2 hidden text-xs lg:inline">Overdue</span>}
        {overdue && <span className="sr-only lg:hidden"> · Overdue</span>}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Link href={href} aria-label={`Open board for ${project.name}`} className="hidden items-center gap-1 text-xs font-medium hover:underline sm:flex">
            Open board <ArrowUpRight className="size-3" />
          </Link>
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
        </div>
      </TableCell>
    </TableRow>
  )
}
