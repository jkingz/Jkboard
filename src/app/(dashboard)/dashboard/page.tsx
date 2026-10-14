import { OverviewStats } from "./components/overview-stats"
import {
  ProjectProgressChart,
  TaskCompletionChart,
} from "./components/overview-charts"
import { RecentProjects } from "./components/recent-projects"
import { RecentTasks } from "./components/recent-tasks"

export default function OverviewPage() {
  return (
    <>
      {/* Page Title and Description */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Everything your team is working on, and what is at risk.
          </p>
        </div>
      </div>

      <div className="flex flex-col @container/main px-4 lg:px-6 gap-6">
        <OverviewStats />

        <div className="grid gap-6 @3xl:grid-cols-2">
          <TaskCompletionChart />
          <ProjectProgressChart />
        </div>

        <div className="grid gap-6 @4xl:grid-cols-2">
          <RecentProjects />
          <RecentTasks />
        </div>
      </div>
    </>
  )
}