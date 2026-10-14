"use client"

import type { ReactTable, RowData } from "@tanstack/react-table"
import type { DataTableFeatures } from "@/lib/data-table"
import { RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTableViewOptions } from "./data-table-view-options"
import { AddTaskModal } from "./add-task-modal"

import { useFlowBoard } from "@/data/flowboard-store"
import { taskPriorities, taskStatuses } from "@/data/flowboard"

interface DataTableToolbarProps<TData extends RowData> {
  table: ReactTable<DataTableFeatures, TData>
}

export function DataTableToolbar<TData extends RowData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { projects } = useFlowBoard()
  const isFiltered = table.state.columnFilters.length > 0

  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: project.name,
  }))

  function setColumnFilter(columnId: string, value: string | null) {
    const column = table.getColumn(columnId)
    column?.setFilterValue(!value || value === "all" ? undefined : value)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter Section */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Select
          items={[{ label: "All statuses", value: "all" }, ...taskStatuses]}
          value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) => setColumnFilter("status", value)}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all" className="cursor-pointer">
                All statuses
              </SelectItem>
              {taskStatuses.map((status) => (
                <SelectItem
                  key={status.value}
                  value={status.value}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    <status.icon className="mr-2 size-4 text-muted-foreground" />
                    {status.label}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          items={[{ label: "All projects", value: "all" }, ...projectOptions]}
          value={
            (table.getColumn("projectId")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) => setColumnFilter("projectId", value)}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all" className="cursor-pointer">
                All projects
              </SelectItem>
              {projectOptions.map((project) => (
                <SelectItem
                  key={project.value}
                  value={project.value}
                  className="cursor-pointer"
                >
                  {project.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          items={[
            { label: "All priorities", value: "all" },
            ...taskPriorities,
          ]}
          value={
            (table.getColumn("priority")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) => setColumnFilter("priority", value)}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all" className="cursor-pointer">
                All priorities
              </SelectItem>
              {taskPriorities.map((priority) => (
                <SelectItem
                  key={priority.value}
                  value={priority.value}
                  className="cursor-pointer"
                >
                  {priority.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Search and Actions Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search tasks"
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="w-[200px] lg:w-[300px] cursor-text"
          />
          <Button
            variant="outline"
            onClick={() => table.resetColumnFilters()}
            className="px-3 cursor-pointer"
            disabled={!isFiltered}
          >
            <RefreshCcw data-icon="inline-start" />
            <span className="hidden lg:block">Reset filters</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
          <AddTaskModal />
        </div>
      </div>
    </div>
  )
}