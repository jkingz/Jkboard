"use client"

import { DeadlineCalendar } from "./components/deadline-calendar"
import { useFlowBoard } from "@/data/flowboard-store"
import { isOverdue } from "@/data/flowboard"

export default function CalendarPage() {
  const { tasks } = useFlowBoard()

  const upcoming = tasks
    .filter((task) => task.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 14)
  const overdue = upcoming.filter(isOverdue).length

  return (
    <>
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Every upcoming deadline in the workspace
            {overdue > 0 ? `, including ${overdue} already overdue.` : "."}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col @container/main px-4 lg:px-6">
        <DeadlineCalendar />
      </div>
    </>
  )
}