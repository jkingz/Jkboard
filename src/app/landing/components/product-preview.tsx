"use client"

import { useRef } from "react"
import { AnimatePresence, LayoutGroup, motion, type Variants } from "motion/react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  dateFromToday,
  formatShortDate,
  getMember,
  getProjectProgress,
  getTaskStatus,
  members,
  priorityClasses,
  projectProgressSeries,
  projects,
  tasks,
  type Task,
  type TaskPriority,
} from "@/data/jkboard"
import { CountUp, ease, useTicker } from "./landing-motion"

/**
 * The product's own UI is the page's imagery (docs/ui.md → Imagery). Every
 * figure here is derived from the seeded sample data in `src/data/jkboard.ts`,
 * never typed in by hand (docs/ui.md → Honesty constraints).
 */

export type PreviewKind = "overview" | "board" | "tasks" | "calendar"

const previewTitles: Record<PreviewKind, string> = {
  overview: "Workspace overview",
  board: "Project board",
  tasks: "All tasks",
  calendar: "Deadline calendar",
}

/** The project every section previews, so the page tells one story. */
const featured = projects[0]

const featuredOpen = tasks
  .filter((task) => task.projectId === featured.id && task.status !== "completed")
  .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

const boardColumns = ["todo", "in-progress", "in-review", "completed"] as const

/** Plays once, the first time a preview scrolls into view. */
const viewport = { once: true, margin: "0px 0px -15% 0px" } as const

const stagger: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}

const spring = { type: "spring", stiffness: 260, damping: 30 } as const

function Initials({ task }: { task: Task }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
      {getMember(task.assigneeId)?.initials}
    </span>
  )
}

function PriorityBadge({ task }: { task: Task }) {
  return (
    <Badge
      variant="outline"
      className={cn("px-1.5 text-[11px] capitalize", priorityClasses[task.priority])}
    >
      {task.priority}
    </Badge>
  )
}

/* -------------------------------------------------------------------------- */

/** Demo workspace totals. */
const sampleCounts = [
  { label: "Projects", value: projects.length },
  { label: "Tasks", value: tasks.length },
  { label: "Teammates", value: members.length },
]

/**
 * The overview acts out a working afternoon: every few seconds the next open
 * task in the featured project is completed, the activity feed reports it, and
 * the project's progress bar and the completed count catch up.
 */
function OverviewPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const tick = useTicker(ref, 2800)
  const done = tick % (featuredOpen.length + 1)
  const doneIds = new Set(featuredOpen.slice(0, done).map((task) => task.id))
  const live = tasks.map((task) => (doneIds.has(task.id) ? { ...task, status: "completed" as const } : task))

  const completed = live.filter((task) => task.status === "completed").length
  const stats = [...sampleCounts.slice(0, 2), { label: "Completed", value: completed }]
  const highlights = projectProgressSeries.slice(0, 4).map((entry, i) =>
    i === 0 ? { ...entry, progress: getProjectProgress(featured.id, live).progress } : entry
  )

  // Newest event: the task just completed, or the project's real last completion.
  const latest =
    done > 0
      ? featuredOpen[done - 1]
      : tasks.find((task) => task.projectId === featured.id && task.status === "completed")!
  const who = getMember(latest.assigneeId)

  return (
    <div ref={ref} className="flex flex-col gap-6">
      <motion.dl
        className="grid grid-cols-3 gap-3"
        variants={stagger}
        initial="hidden"
        whileInView="shown"
        viewport={viewport}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={rise}
            className="rounded-md border bg-background/40 px-4 py-3"
          >
            <dt className="text-[13px] font-medium text-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">
              <CountUp value={stat.value} />
            </dd>
          </motion.div>
        ))}
      </motion.dl>

      <div className="flex flex-col gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">Project progress</p>
        {highlights.map((entry, i) => (
          <div key={entry.project} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-[13px] font-medium sm:w-40">{entry.name}</span>
            <div
              role="progressbar"
              aria-label={entry.name}
              aria-valuenow={entry.progress}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
            >
              <motion.div
                className="h-full origin-left rounded-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${entry.progress}%` }}
                transition={{ duration: 1.2, ease, delay: tick === 0 ? 0.3 + i * 0.1 : 0 }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-[13px] tabular-nums text-muted-foreground">
              <CountUp value={entry.progress} />%
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 border-t pt-4">
        <span className="relative flex size-2 shrink-0" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        <div className="relative h-6 min-w-0 flex-1 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.p
              key={latest.id}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.5, ease }}
              className="absolute inset-0 truncate text-[13px] leading-6"
            >
              <span className="font-semibold">{who?.name.split(" ")[0]}</span>
              <span className="text-muted-foreground"> completed </span>
              <span className="font-medium">{latest.title}</span>
            </motion.p>
          </AnimatePresence>
        </div>
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{latest.reference}</span>
      </div>
    </div>
  )
}

/** The card that walks across the board while the preview is on screen. */
const mover = tasks.find((task) => task.projectId === featured.id && task.status === "todo")!

function BoardPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const tick = useTicker(ref, 2600)
  const moverStatus = boardColumns[(boardColumns.indexOf("todo") + tick) % boardColumns.length]
  const boardTasks = tasks
    .filter((task) => task.projectId === featured.id)
    .map((task) => (task.id === mover.id ? { ...task, status: moverStatus } : task))

  return (
    <LayoutGroup>
      <motion.div
        ref={ref}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        variants={stagger}
        initial="hidden"
        whileInView="shown"
        viewport={viewport}
      >
        {boardColumns.map((status) => {
          const columnTasks = boardTasks.filter((task) => task.status === status)

          return (
            <motion.div key={status} variants={rise} className="flex flex-col gap-2">
              <p className="flex items-center justify-between text-[13px] font-semibold">
                {getTaskStatus(status).label}
                <motion.span
                  key={columnTasks.length}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="tabular-nums text-muted-foreground"
                >
                  {columnTasks.length}
                </motion.span>
              </p>
              {columnTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layoutId={task.id}
                  transition={spring}
                  className={cn(
                    "rounded-md border bg-background/40 p-3",
                    task.id === mover.id && tick > 0 && "border-ring shadow-lg shadow-black/10"
                  )}
                >
                  <p className="font-mono text-[11px] text-muted-foreground">{task.reference}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug">
                    {task.title}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <PriorityBadge task={task} />
                    <Initials task={task} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        })}
      </motion.div>
    </LayoutGroup>
  )
}

const priorityRank: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }

function TasksPreview() {
  const ref = useRef<HTMLDivElement>(null)
  // Alternates the sort so the rows visibly re-order, as they do in the real table.
  const byPriority = useTicker(ref, 3200) % 2 === 1
  const rows = featuredOpen
    .slice(0, 5)
    .sort((a, b) =>
      byPriority
        ? priorityRank[a.priority] - priorityRank[b.priority] || a.dueDate.localeCompare(b.dueDate)
        : a.dueDate.localeCompare(b.dueDate)
    )
  const sortChip = byPriority ? "Sort: Priority" : "Sort: Due date ↑"

  return (
    <div ref={ref} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 text-[13px]">
        {[`Project: ${featured.name}`, "Status: Open"].map((chip) => (
          <span key={chip} className="rounded-md border px-2.5 py-1 font-medium">
            {chip}
          </span>
        ))}
        <motion.span
          key={sortChip}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease }}
          className="rounded-md border border-ring bg-accent px-2.5 py-1 font-medium text-accent-foreground"
        >
          {sortChip}
        </motion.span>
      </div>

      <table className="w-full text-left text-[13px]">
        <thead className="text-muted-foreground">
          <tr className="border-b">
            <th className="py-2 pr-3 font-medium">Task</th>
            <th className="hidden py-2 pr-3 font-medium sm:table-cell">Status</th>
            <th className="py-2 pr-3 font-medium">Priority</th>
            <th className="hidden py-2 pr-3 font-medium sm:table-cell">Owner</th>
            <th className="py-2 font-medium">Due</th>
          </tr>
        </thead>
        <motion.tbody variants={stagger} initial="hidden" whileInView="shown" viewport={viewport}>
          {rows.map((task) => (
            <motion.tr
              key={task.id}
              layout="position"
              variants={rise}
              transition={spring}
              className="border-b last:border-b-0"
            >
              <td className="max-w-0 truncate py-2.5 pr-3 font-medium sm:w-1/2">{task.title}</td>
              <td className="hidden py-2.5 pr-3 text-muted-foreground sm:table-cell">
                {getTaskStatus(task.status).label}
              </td>
              <td className="py-2.5 pr-3">
                <PriorityBadge task={task} />
              </td>
              <td className="hidden py-2.5 pr-3 sm:table-cell">
                <Initials task={task} />
              </td>
              <td className="py-2.5 tabular-nums text-muted-foreground">
                {formatShortDate(task.dueDate)}
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  )
}

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/**
 * A spotlight walks the upcoming deadlines: the chip in the grid and its row in
 * the list light up together, so the two halves read as one view.
 */
function CalendarPreview() {
  const ref = useRef<HTMLDivElement>(null)
  // Two weeks from this Monday, on the UTC calendar like every date in the data.
  const mondayOffset = -((new Date().getUTCDay() + 6) % 7)
  const days = Array.from({ length: 14 }, (_, i) => dateFromToday(mondayOffset + i))
  const today = dateFromToday(0)
  const upcoming = featuredOpen.filter((task) => task.dueDate >= today).slice(0, 3)
  const tick = useTicker(ref, 2200)
  const focus = upcoming[tick % Math.max(upcoming.length, 1)]

  return (
    <div ref={ref} className="grid gap-6 lg:grid-cols-[1fr_16rem]">
      <div>
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-[13px] font-medium text-muted-foreground">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <motion.div
        className="grid grid-cols-7 gap-1.5 text-[13px]"
        initial="hidden"
        whileInView="shown"
        viewport={viewport}
        variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.035 } } }}
      >
        {days.map((iso) => {
          const due = featuredOpen.filter((task) => task.dueDate === iso)
          const isToday = iso === today
          return (
            <motion.div
              key={iso}
              variants={{
                hidden: { opacity: 0, scale: 0.9, y: 8 },
                shown: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease } },
              }}
              className={cn(
                "relative flex min-h-18 flex-col gap-1 rounded-md border p-1.5",
                iso < today && "opacity-60",
                isToday && "border-foreground"
              )}
            >
              {isToday && (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-px rounded-md border-2 border-ring"
                  animate={{ opacity: [0.9, 0.2, 0.9] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <span className={cn("tabular-nums", isToday ? "font-semibold" : "text-muted-foreground")}>
                {Number(iso.slice(8))}
              </span>
              {due.map((task) => (
                <motion.span
                  key={task.id}
                  variants={{
                    hidden: { opacity: 0, x: -8 },
                    shown: { opacity: 1, x: 0, transition: { delay: 0.5, ...spring } },
                  }}
                  animate={{ scale: focus?.id === task.id ? 1.06 : 1 }}
                  className={cn(
                    "truncate rounded-sm px-1 py-0.5 text-[11px] font-medium transition-colors duration-300",
                    focus?.id === task.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {task.title}
                </motion.span>
              ))}
            </motion.div>
          )
        })}
      </motion.div>
      </div>

      <div>
        <p className="text-[15px] font-semibold">Upcoming deadlines</p>
        <motion.ul
          className="mt-3 flex flex-col gap-1"
          variants={stagger}
          initial="hidden"
          whileInView="shown"
          viewport={viewport}
        >
          {upcoming.map((task) => (
            <motion.li
              key={task.id}
              variants={{
                hidden: { opacity: 0, x: 16 },
                shown: { opacity: 1, x: 0, transition: { duration: 0.6, ease } },
              }}
              className="relative flex items-start gap-3 rounded-md px-2 py-2"
            >
              {focus?.id === task.id && (
                <motion.span
                  layoutId="deadline-focus"
                  transition={spring}
                  className="absolute inset-0 rounded-md bg-accent"
                  aria-hidden="true"
                />
              )}
              <span className="relative w-12 shrink-0 text-[13px] font-semibold tabular-nums">
                {formatShortDate(task.dueDate)}
              </span>
              <span className="relative min-w-0">
                <span className="block truncate text-[13px] font-medium">{task.title}</span>
                <span className="text-[13px] text-muted-foreground">
                  {getTaskStatus(task.status).label}
                </span>
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  )
}

const previews: Record<PreviewKind, () => React.ReactElement> = {
  overview: OverviewPreview,
  board: BoardPreview,
  tasks: TasksPreview,
  calendar: CalendarPreview,
}

/* -------------------------------------------------------------------------- */

export function ProductPreview({
  kind = "overview",
  className,
}: {
  kind?: PreviewKind
  className?: string
}) {
  const Body = previews[kind]

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card text-card-foreground", className)}>
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
        <p className="truncate text-[13px] font-semibold">
          {kind === "overview" ? previewTitles[kind] : `${featured.name} · ${previewTitles[kind]}`}
        </p>
        {/* Sample data from the demo workspace, not the visitor's (docs/target-state.md). */}
        <span className="shrink-0 text-[11px] text-muted-foreground">Example data</span>
      </div>
      <div className="p-5">
        <Body />
      </div>
    </div>
  )
}
