"use client"

import type { Row, RowData } from "@tanstack/react-table"
import type { DataTableFeatures } from "@/lib/data-table"
import { Copy, Eye, MoreHorizontal, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableRowActionsProps<TData extends RowData> {
  row: Row<DataTableFeatures, TData>
  onViewTask: (taskId: string) => void
  onDuplicateTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
}

export function DataTableRowActions<TData extends RowData>({
  row,
  onViewTask,
  onDuplicateTask,
  onDeleteTask,
}: DataTableRowActionsProps<TData>) {
  const task = row.original as { id: string; reference?: string }
  const taskId = task.id
  const label = task.reference ?? taskId

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="flex size-8 p-0 data-popup-open:bg-muted cursor-pointer"
          />
        }
      >
        <MoreHorizontal data-icon="inline-start" />
        <span className="sr-only">Open menu for {label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[170px]">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onViewTask(taskId)}
          >
            <Eye />
            View task
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onDuplicateTask(taskId)}
          >
            <Copy />
            Duplicate
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            variant="destructive"
            onClick={() => onDeleteTask(taskId)}
          >
            <Trash2 />
            Delete
            <DropdownMenuShortcut className="text-destructive">
              ⌘⌫
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}