import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronsUp,
  Circle,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CirclePause,
  TriangleAlert,
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { z } from "zod"

/* -------------------------------------------------------------------------- */
/*                                   Schemas                                  */
/* -------------------------------------------------------------------------- */

export const projectStatusSchema = z.enum([
  "planning",
  "active",
  "on-hold",
  "completed",
])

export const taskStatusSchema = z.enum([
  "todo",
  "in-progress",
  "in-review",
  "completed",
])

export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"])

export const memberStatusSchema = z.enum(["Active", "Invited", "Away"])

export const memberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  initials: z.string(),
  role: z.string(),
  status: memberStatusSchema,
  joinedDate: z.string(),
  lastActive: z.string(),
})

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  description: z.string(),
  status: projectStatusSchema,
  color: z.string(),
  startDate: z.string(),
  dueDate: z.string(),
  memberIds: z.array(z.string()),
})

export const taskSchema = z.object({
  id: z.string(),
  /** Short human key shown in the UI, e.g. "TSK-0042". */
  reference: z.string(),
  title: z.string(),
  projectId: z.string(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  assigneeId: z.string(),
  dueDate: z.string(),
})

export type ProjectStatus = z.infer<typeof projectStatusSchema>
export type TaskStatus = z.infer<typeof taskStatusSchema>
export type TaskPriority = z.infer<typeof taskPrioritySchema>
export type MemberStatus = z.infer<typeof memberStatusSchema>
export type Member = z.infer<typeof memberSchema>
export type Project = z.infer<typeof projectSchema>
export type Task = z.infer<typeof taskSchema>

/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

function toISODate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

/** ISO date `offsetDays` away from today — keeps the mock data always relative. */
export function dateFromToday(offsetDays: number) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + offsetDays)
  return toISODate(date)
}

export function formatDate(isoDate: string) {
  return format(parseISO(isoDate), "MMM d, yyyy")
}

export function formatShortDate(isoDate: string) {
  return format(parseISO(isoDate), "MMM d")
}

/** Positive when the date is still ahead, negative once it has passed. */
export function daysUntil(isoDate: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round(
    (parseISO(isoDate).getTime() - today.getTime()) / 86_400_000
  )
}

export function isOverdue(task: Task) {
  return task.status !== "completed" && daysUntil(task.dueDate) < 0
}

/* -------------------------------------------------------------------------- */
/*                                Option catalogs                             */
/* -------------------------------------------------------------------------- */

export const projectStatuses = [
  { value: "planning", label: "Planning", icon: CircleDashed },
  { value: "active", label: "Active", icon: CircleDot },
  { value: "on-hold", label: "On hold", icon: CirclePause },
  { value: "completed", label: "Completed", icon: CircleCheck },
] satisfies { value: ProjectStatus; label: string; icon: typeof Circle }[]

export const taskStatuses = [
  { value: "todo", label: "To do", icon: Circle },
  { value: "in-progress", label: "In progress", icon: CircleDot },
  { value: "in-review", label: "In review", icon: CircleDashed },
  { value: "completed", label: "Completed", icon: CircleCheck },
] satisfies { value: TaskStatus; label: string; icon: typeof Circle }[]

export const taskPriorities = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] satisfies { value: TaskPriority; label: string }[]

/** Tailwind class pairs keyed by value, used to tint badges consistently. */
export const priorityClasses: Record<TaskPriority, string> = {
  urgent: "border-destructive/40 text-destructive bg-destructive/5",
  high: "border-warning/40 text-warning bg-warning/5",
  medium: "border-info/40 text-info bg-info/5",
  low: "border-border text-muted-foreground bg-muted/50",
}

export const projectStatusClasses: Record<ProjectStatus, string> = {
  planning: "border-info/40 text-info bg-info/5",
  active: "border-success/40 text-success bg-success/5",
  "on-hold": "border-warning/40 text-warning bg-warning/5",
  completed: "border-border text-muted-foreground bg-muted/50",
}

export const priorityIcons: Record<TaskPriority, typeof ArrowUp> = {
  urgent: TriangleAlert,
  high: ChevronsUp,
  medium: ArrowUp,
  low: ArrowDown,
}

/** Neutral used for the "no change" trend case in metric cards. */
export const neutralTrendIcon = ArrowUpDown

/** Swatches offered when creating a project. */
export const projectColorOptions = [
  { label: "Violet", value: "var(--chart-1)" },
  { label: "Teal", value: "var(--chart-2)" },
  { label: "Amber", value: "var(--chart-3)" },
  { label: "Emerald", value: "var(--chart-4)" },
  { label: "Rose", value: "var(--chart-5)" },
]

/* -------------------------------------------------------------------------- */
/*                                  Mock data                                 */
/* -------------------------------------------------------------------------- */

export const members: Member[] = [
  {
    id: "u-1",
    name: "Maya Chen",
    email: "maya.chen@flowboard.app",
    initials: "MC",
    role: "Product Lead",
    status: "Active",
    joinedDate: "2024-02-12",
    lastActive: "Today, 9:14 AM",
  },
  {
    id: "u-2",
    name: "Daniel Okafor",
    email: "daniel.okafor@flowboard.app",
    initials: "DO",
    role: "Engineering Lead",
    status: "Active",
    joinedDate: "2024-03-04",
    lastActive: "Today, 8:02 AM",
  },
  {
    id: "u-3",
    name: "Priya Raman",
    email: "priya.raman@flowboard.app",
    initials: "PR",
    role: "Product Designer",
    status: "Active",
    joinedDate: "2024-04-19",
    lastActive: "Yesterday, 4:41 PM",
  },
  {
    id: "u-4",
    name: "Tom Becker",
    email: "tom.becker@flowboard.app",
    initials: "TB",
    role: "Frontend Engineer",
    status: "Active",
    joinedDate: "2024-06-01",
    lastActive: "Today, 7:55 AM",
  },
  {
    id: "u-5",
    name: "Sofia Alvarez",
    email: "sofia.alvarez@flowboard.app",
    initials: "SA",
    role: "QA Engineer",
    status: "Away",
    joinedDate: "2024-06-24",
    lastActive: "Mon, 5:20 PM",
  },
  {
    id: "u-6",
    name: "Kenji Watanabe",
    email: "kenji.watanabe@flowboard.app",
    initials: "KW",
    role: "Backend Engineer",
    status: "Active",
    joinedDate: "2024-08-15",
    lastActive: "Today, 10:02 AM",
  },
  {
    id: "u-7",
    name: "Nora Lindqvist",
    email: "nora.lindqvist@flowboard.app",
    initials: "NL",
    role: "UX Researcher",
    status: "Invited",
    joinedDate: "2025-01-08",
    lastActive: "Invite sent 3 days ago",
  },
  {
    id: "u-8",
    name: "Liam O'Connell",
    email: "liam.oconnell@flowboard.app",
    initials: "LO",
    role: "Data Analyst",
    status: "Active",
    joinedDate: "2024-09-30",
    lastActive: "Today, 11:37 AM",
  },
]

export const projects: Project[] = [
  {
    id: "p-1",
    name: "Mobile App Redesign",
    key: "MOB",
    description:
      "Rebuild the iOS and Android clients on the new design system and ship offline support.",
    status: "active",
    color: "var(--chart-1)",
    startDate: dateFromToday(-38),
    dueDate: dateFromToday(21),
    memberIds: ["u-1", "u-3", "u-4", "u-7"],
  },
  {
    id: "p-2",
    name: "Q3 Marketing Campaign",
    key: "MKT",
    description:
      "Multi-channel launch campaign across paid social, lifecycle email and the partner blog.",
    status: "active",
    color: "var(--chart-2)",
    startDate: dateFromToday(-24),
    dueDate: dateFromToday(12),
    memberIds: ["u-3", "u-5", "u-8"],
  },
  {
    id: "p-3",
    name: "Billing & Invoicing",
    key: "BIL",
    description:
      "Usage-based billing, proration on plan changes and a self-serve invoice archive.",
    status: "active",
    color: "var(--chart-3)",
    startDate: dateFromToday(-52),
    dueDate: dateFromToday(34),
    memberIds: ["u-2", "u-6"],
  },
  {
    id: "p-4",
    name: "Customer Portal v2",
    key: "POR",
    description:
      "Self-service portal for invoices, seats, saved views and audit log exports.",
    status: "planning",
    color: "var(--chart-4)",
    startDate: dateFromToday(-5),
    dueDate: dateFromToday(6),
    memberIds: ["u-1", "u-4", "u-7", "u-8"],
  },
  {
    id: "p-5",
    name: "Data Warehouse Migration",
    key: "DAT",
    description:
      "Move reporting workloads off the primary cluster onto the new warehouse schema.",
    status: "on-hold",
    color: "var(--chart-5)",
    startDate: dateFromToday(-70),
    dueDate: dateFromToday(47),
    memberIds: ["u-2", "u-6", "u-8"],
  },
  {
    id: "p-6",
    name: "Brand Refresh",
    key: "BRD",
    description:
      "New identity, marketing site refresh and updated product iconography.",
    status: "completed",
    color: "var(--chart-2)",
    startDate: dateFromToday(-96),
    dueDate: dateFromToday(-9),
    memberIds: ["u-3", "u-7"],
  },
]

/** Compact seeds keep the fixture readable: title, project, status, priority, owner, due offset. */
type TaskSeed = [
  title: string,
  projectId: string,
  status: TaskStatus,
  priority: TaskPriority,
  assigneeId: string,
  dueOffset: number,
]

const taskSeeds: TaskSeed[] = [
  ["Finalise onboarding flow copy", "p-1", "completed", "medium", "u-1", -12],
  ["Implement offline task queue", "p-1", "in-progress", "urgent", "u-4", 2],
  ["Audit colour contrast in dark mode", "p-1", "todo", "medium", "u-3", 5],
  ["Ship push notification settings", "p-1", "in-review", "high", "u-4", 3],
  ["Prototype gesture navigation", "p-1", "in-progress", "high", "u-7", 9],
  ["Migrate build pipeline to EAS", "p-1", "todo", "low", "u-2", 17],
  ["Regression pass on Android 15", "p-1", "todo", "medium", "u-5", 12],

  ["Book the paid social budget", "p-2", "completed", "high", "u-8", -8],
  ["Write lifecycle email sequence", "p-2", "in-progress", "medium", "u-3", 4],
  ["Build campaign attribution report", "p-2", "todo", "high", "u-8", 7],
  ["Produce launch video cutdowns", "p-2", "in-review", "medium", "u-5", 1],
  ["Review partner blog placements", "p-2", "todo", "low", "u-3", 10],
  ["Set up UTM naming convention", "p-2", "completed", "medium", "u-8", -3],

  ["Model proration on plan change", "p-3", "in-progress", "urgent", "u-6", 6],
  ["Invoice PDF redesign", "p-3", "in-review", "medium", "u-2", 3],
  ["Add usage metering to API gateway", "p-3", "todo", "high", "u-6", 14],
  ["Backfill historical invoices", "p-3", "todo", "medium", "u-6", 19],
  ["Dunning emails for failed payments", "p-3", "in-progress", "high", "u-1", 8],
  ["Localise billing strings (DE, FR)", "p-3", "todo", "low", "u-3", 24],
  ["Tax rate lookup integration", "p-3", "todo", "medium", "u-2", 27],

  ["Interview five portal power users", "p-4", "in-progress", "high", "u-7", 2],
  ["Draft saved-views information architecture", "p-4", "in-review", "medium", "u-1", -1],
  ["Prototype audit log export", "p-4", "todo", "medium", "u-4", 4],
  ["Seat management API contract", "p-4", "todo", "high", "u-6", 5],
  ["Accessibility audit of portal forms", "p-4", "todo", "low", "u-5", 6],

  ["Inventory reporting queries", "p-5", "completed", "medium", "u-6", -10],
  ["Size the new warehouse cluster", "p-5", "todo", "urgent", "u-2", 22],
  ["Map legacy report dependencies", "p-5", "todo", "high", "u-8", 29],
  ["Write backfill runbook", "p-5", "todo", "medium", "u-6", 36],

  ["Approve new wordmark", "p-6", "completed", "high", "u-1", -14],
  ["Update marketing site imagery", "p-6", "completed", "medium", "u-3", -11],
  ["Publish brand guidelines", "p-6", "completed", "low", "u-7", -9],

  ["Resolve flaky checkout test", "p-3", "in-progress", "urgent", "u-5", -4],
  ["Fix calendar timezone drift", "p-4", "todo", "urgent", "u-4", -2],
  ["Correct overdue badge contrast", "p-1", "in-progress", "high", "u-3", -1],
  ["Verify CSV export encoding", "p-5", "in-review", "medium", "u-8", 3],
]

export const tasks: Task[] = taskSeeds.map(
  ([title, projectId, status, priority, assigneeId, dueOffset], index) => {
    const key = `TSK-${String(index + 1).padStart(4, "0")}`

    return {
      id: key,
      reference: key,
      title,
      projectId,
      status,
      priority,
      assigneeId,
      dueDate: dateFromToday(dueOffset),
    }
  }
)

/* -------------------------------------------------------------------------- */
/*                              Lookup + selectors                            */
/* -------------------------------------------------------------------------- */

export function getProject(projectId: string, source: Project[] = projects) {
  return source.find((project) => project.id === projectId)
}

export function getMember(memberId: string, source: Member[] = members) {
  return source.find((member) => member.id === memberId)
}

export function getTaskStatus(value: TaskStatus) {
  return taskStatuses.find((status) => status.value === value)!
}

export function getProjectStatus(value: ProjectStatus) {
  return projectStatuses.find((status) => status.value === value)!
}

export function getTasksForProject(
  projectId: string,
  source: Task[] = tasks
) {
  return source.filter((task) => task.projectId === projectId)
}

export interface ProjectProgress {
  total: number
  completed: number
  progress: number
}

export function getProjectProgress(
  projectId: string,
  source: Task[] = tasks
): ProjectProgress {
  const projectTasks = getTasksForProject(projectId, source)
  const completed = projectTasks.filter(
    (task) => task.status === "completed"
  ).length

  return {
    total: projectTasks.length,
    completed,
    progress: projectTasks.length
      ? Math.round((completed / projectTasks.length) * 100)
      : 0,
  }
}

export interface TaskStats {
  total: number
  active: number
  completed: number
  overdue: number
  completionRate: number
}

export function getTaskStats(taskList: Task[] = tasks): TaskStats {
  const completed = taskList.filter((task) => task.status === "completed").length
  const overdue = taskList.filter(isOverdue).length

  return {
    total: taskList.length,
    active: taskList.length - completed,
    completed,
    overdue,
    completionRate: taskList.length
      ? Math.round((completed / taskList.length) * 100)
      : 0,
  }
}

export function getUpcomingTasks(limit?: number, source: Task[] = tasks) {
  const upcoming = source
    .filter((task) => task.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  return typeof limit === "number" ? upcoming.slice(0, limit) : upcoming
}

export function getRecentTasks(limit = 6, source: Task[] = tasks) {
  return [...source]
    .filter((task) => task.status === "completed")
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
    .slice(0, limit)
}

export function getWorkload(memberId: string, source: Task[] = tasks) {
  return {
    assigned: source.filter(
      (task) => task.assigneeId === memberId && task.status !== "completed"
    ).length,
    completed: source.filter(
      (task) => task.assigneeId === memberId && task.status === "completed"
    ).length,
  }
}

/* -------------------------------------------------------------------------- */
/*                                Chart datasets                              */
/* -------------------------------------------------------------------------- */

/** Completed vs. newly created tasks over the last twelve weeks. */
export const taskCompletionTrend = [
  { week: "W1", completed: 12, created: 15 },
  { week: "W2", completed: 16, created: 14 },
  { week: "W3", completed: 14, created: 18 },
  { week: "W4", completed: 21, created: 17 },
  { week: "W5", completed: 19, created: 22 },
  { week: "W6", completed: 24, created: 20 },
  { week: "W7", completed: 22, created: 25 },
  { week: "W8", completed: 28, created: 23 },
  { week: "W9", completed: 26, created: 27 },
  { week: "W10", completed: 31, created: 26 },
  { week: "W11", completed: 29, created: 30 },
  { week: "W12", completed: 34, created: 28 },
]

/** Per-project completion, derived so the chart always matches the fixtures. */
export const projectProgressSeries = projects.map((project) => {
  const { progress, total } = getProjectProgress(project.id)
  return { project: project.key, name: project.name, color: project.color, progress, tasks: total }
})

/** Open work per member, used for the team workload bars. */
export const teamWorkload = members.map((member) => ({
  member: member.name,
  initials: member.initials,
  ...getWorkload(member.id),
}))