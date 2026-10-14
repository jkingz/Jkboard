"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { DataTableFeatures } from "@/lib/data-table"
import { CalendarClock, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  formatShortDate,
  getTaskStatus,
  isOverdue,
  priorityClasses,
  priorityIcons,
  type Member,
  type Project,
  type Task,
} from "@/data/jkboard"

import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

interface BuildColumnsOptions {
  projects: Project[]
  members: Member[]
  onViewTask: (taskId: string) => void
  onDuplicateTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

export function buildTaskColumns({
  projects,
  members,
  onViewTask,
  onDuplicateTask,
  onDeleteTask,
}: BuildColumnsOptions): ColumnDef<DataTableFeatures, Task>[] {
  const projectName = (projectId: string) =>
    projects.find((project) => project.id === projectId)

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px] cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px] cursor-pointer"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Task" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => onViewTask(row.original.id)}
            className="max-w-[320px] truncate text-left font-medium hover:underline"
          >
            {row.getValue("title")}
          </button>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {row.original.reference}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "projectId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project" />
      ),
      cell: ({ row }) => {
        const project = projectName(row.getValue("projectId"))
        if (!project) return null

        return (
          <div className="flex w-[140px] items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: project.color }}
              aria-hidden="true"
            />
            <span className="truncate text-sm">{project.name}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = getTaskStatus(row.getValue("status"))

        return (
          <div className="flex w-[130px] items-center">
            <status.icon className="mr-2 size-4 text-muted-foreground" />
            <span className="text-sm">{status.label}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = row.getValue("priority") as Task["priority"]
        const PriorityIcon = priorityIcons[priority]

        return (
          <Badge variant="outline" className={priorityClasses[priority]}>
            <PriorityIcon />
            {priority}
          </Badge>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due date" />
      ),
      cell: ({ row }) => {
        const task = row.original
        const overdue = isOverdue(task)

        return (
          <div
            className={cn(
              "flex w-[120px] items-center gap-1.5 text-sm tabular-nums",
              overdue ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {overdue ? (
              <TriangleAlert className="size-3.5" />
            ) : (
              <CalendarClock className="size-3.5" />
            )}
            {formatShortDate(task.dueDate)}
          </div>
        )
      },
    },
    {
      accessorKey: "assigneeId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assignee" />
      ),
      cell: ({ row }) => {
        const member = members.find(
          (entry) => entry.id === row.getValue("assigneeId")
        )
        if (!member) return null

        return (
          <div className="flex w-[160px] items-center gap-2">
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">
                {member.initials}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm">{member.name}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onViewTask={onViewTask}
          onDuplicateTask={onDuplicateTask}
          onDeleteTask={onDeleteTask}
        />
      ),
    },
  ]
}