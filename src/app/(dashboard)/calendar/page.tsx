import { dateFromToday } from "@/data/jkboard"

import { DeadlineCalendar } from "./components/deadline-calendar"

export default function CalendarPage() {
  return (
    <div className="flex min-w-0 flex-col gap-4 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a date to see what’s due across the workspace.
        </p>
      </div>
      <DeadlineCalendar initialDate={dateFromToday(0)} />
    </div>
  )
}
