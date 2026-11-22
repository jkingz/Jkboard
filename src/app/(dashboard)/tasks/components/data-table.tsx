"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowSelectionState,
  type SortingState,
  flexRender,
  useTable,
} from "@tanstack/react-table"

import { dataTableFeatures, type DataTableFeatures } from "@/lib/data-table"
import type { Task } from "@/data/jkboard"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"

interface DataTableProps {
  columns: ColumnDef<DataTableFeatures, Task>[]
  data: Task[]
  activeTaskId: string | null
  compact: boolean
}

export function DataTable({ columns, data, activeTaskId, compact }: DataTableProps) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  })

  const showColumn = (id: string) => !compact || !["projectId", "status", "priority"].includes(id)

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <DataTableToolbar table={table} compact={compact} />
      <div className="overflow-hidden rounded-md border bg-card">
        <Table role="table" className="workspace-task-table">
          <TableHeader className="hidden md:table-header-group">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.filter((header) => showColumn(header.column.id)).map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody role="rowgroup">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  role="row"
                  data-state={row.getIsSelected() && "selected"}
                  data-inspected={row.original.id === activeTaskId || undefined}
                >
                  {row.getVisibleCells().filter((cell) => showColumn(cell.column.id)).map((cell) => (
                    <TableCell role="cell" key={cell.id} data-column={cell.column.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow role="row">
                <TableCell
                  role="cell"
                  colSpan={table.getVisibleLeafColumns().filter((column) => showColumn(column.id)).length}
                  className="h-24 text-center"
                >
                  No tasks match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}