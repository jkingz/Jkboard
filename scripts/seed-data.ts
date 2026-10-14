/**
 * Sample workspace used by `scripts/seed.ts`.
 *
 * Mirrors the fixtures the UI used while it was mock-only, but keyed by the
 * stable Better Auth user id (`usr_*`) so the seeded rows can be adopted by the
 * authentication step instead of being re-created.
 */

type ProjectStatus = "planning" | "active" | "on-hold" | "completed"
type TaskStatus = "todo" | "in-progress" | "in-review" | "completed"
type TaskPriority = "urgent" | "high" | "medium" | "low"
type MemberStatus = "active" | "invited" | "away"

function toISODate(offsetDays: number) {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

function userIdFor(email: string) {
  return `usr_${Buffer.from(email.toLowerCase()).toString("base64url").slice(0, 22)}`
}

const DAY = 86_400_000

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000)
}

const people = [
  {
    name: "Maya Chen",
    email: "maya.chen@jkboard.app",
    role: "Product Lead",
    status: "active" as MemberStatus,
    joinedAt: toISODate(-244),
    lastActiveAt: hoursAgo(0.4),
  },
  {
    name: "Daniel Okafor",
    email: "daniel.okafor@jkboard.app",
    role: "Engineering Lead",
    status: "active" as MemberStatus,
    joinedAt: toISODate(-224),
    lastActiveAt: hoursAgo(1.2),
  },
  {
    name: "Priya Raman",
    email: "priya.raman@jkboard.app",
    role: "Product Designer",
    status: "active" as MemberStatus,
    joinedAt: toISODate(-177),
    lastActiveAt: hoursAgo(18),
  },
  {
    name: "Tom Becker",
    email: "tom.becker@jkboard.app",
    role: "Frontend Engineer",
    status: "active" as MemberStatus,
    joinedAt: toISODate(-134),
    lastActiveAt: hoursAgo(1.8),
  },
  {
    name: "Sofia Alvarez",
    email: "sofia.alvarez@jkboard.app",
    role: "QA Engineer",
    status: "away" as MemberStatus,
    joinedAt: toISODate(-110),
    lastActiveAt: hoursAgo(41),
  },
  {
    name: "Kenji Watanabe",
    email: "kenji.watanabe@jkboard.app",
    role: "Backend Engineer",
    status: "active" as MemberStatus,
    joinedAt: toISODate(-59),
    lastActiveAt: hoursAgo(2.3),
  },
  {
    name: "Nora Lindqvist",
    email: "nora.lindqvist@jkboard.app",
    role: "UX Researcher",
    status: "invited" as MemberStatus,
    joinedAt: toISODate(-8),
    lastActiveAt: new Date(Date.now() - 3 * DAY),
  },
  {
    name: "Liam O'Connell",
    email: "liam.oconnell@jkboard.app",
    role: "Data Analyst",
    status: "active" as MemberStatus,
    joinedAt: toISODate(-13),
    lastActiveAt: hoursAgo(0.8),
  },
]

export const seedMembers = people.map((person) => ({
  ...person,
  userId: userIdFor(person.email),
}))

const id = {
  maya: userIdFor("maya.chen@jkboard.app"),
  daniel: userIdFor("daniel.okafor@jkboard.app"),
  priya: userIdFor("priya.raman@jkboard.app"),
  tom: userIdFor("tom.becker@jkboard.app"),
  sofia: userIdFor("sofia.alvarez@jkboard.app"),
  kenji: userIdFor("kenji.watanabe@jkboard.app"),
  nora: userIdFor("nora.lindqvist@jkboard.app"),
  liam: userIdFor("liam.oconnell@jkboard.app"),
}

export const seedProjects = [
  {
    key: "MOB",
    name: "Mobile App Redesign",
    description:
      "Rebuild the iOS and Android clients on the new design system and ship offline support.",
    status: "active" as ProjectStatus,
    color: "var(--chart-1)",
    ownerUserId: id.maya,
    memberUserIds: [id.maya, id.priya, id.tom, id.nora],
    startDate: toISODate(-38),
    dueDate: toISODate(21),
  },
  {
    key: "MKT",
    name: "Q3 Marketing Campaign",
    description:
      "Multi-channel launch campaign across paid social, lifecycle email and the partner blog.",
    status: "active" as ProjectStatus,
    color: "var(--chart-2)",
    ownerUserId: id.priya,
    memberUserIds: [id.priya, id.sofia, id.liam],
    startDate: toISODate(-24),
    dueDate: toISODate(12),
  },
  {
    key: "BIL",
    name: "Billing & Invoicing",
    description:
      "Usage-based billing, proration on plan changes and a self-serve invoice archive.",
    status: "active" as ProjectStatus,
    color: "var(--chart-3)",
    ownerUserId: id.daniel,
    memberUserIds: [id.daniel, id.kenji],
    startDate: toISODate(-52),
    dueDate: toISODate(34),
  },
  {
    key: "POR",
    name: "Customer Portal v2",
    description:
      "Self-service portal for invoices, seats, saved views and audit log exports.",
    status: "planning" as ProjectStatus,
    color: "var(--chart-4)",
    ownerUserId: id.maya,
    memberUserIds: [id.maya, id.tom, id.nora, id.liam],
    startDate: toISODate(-5),
    dueDate: toISODate(6),
  },
  {
    key: "DAT",
    name: "Data Warehouse Migration",
    description:
      "Move reporting workloads off the primary cluster onto the new warehouse schema.",
    status: "on-hold" as ProjectStatus,
    color: "var(--chart-5)",
    ownerUserId: id.daniel,
    memberUserIds: [id.daniel, id.kenji, id.liam],
    startDate: toISODate(-70),
    dueDate: toISODate(47),
  },
  {
    key: "BRD",
    name: "Brand Refresh",
    description:
      "New identity, marketing site refresh and updated product iconography.",
    status: "completed" as ProjectStatus,
    color: "var(--chart-2)",
    ownerUserId: id.priya,
    memberUserIds: [id.priya, id.nora],
    startDate: toISODate(-96),
    dueDate: toISODate(-9),
  },
]

type TaskSeed = [
  title: string,
  projectKey: string,
  status: TaskStatus,
  priority: TaskPriority,
  assigneeUserId: string,
  dueOffset: number,
]

export const seedTaskSeeds: TaskSeed[] = [
  ["Finalise onboarding flow copy", "MOB", "completed", "medium", id.maya, -12],
  ["Implement offline task queue", "MOB", "in-progress", "urgent", id.tom, 2],
  ["Audit colour contrast in dark mode", "MOB", "todo", "medium", id.priya, 5],
  ["Ship push notification settings", "MOB", "in-review", "high", id.tom, 3],
  ["Prototype gesture navigation", "MOB", "in-progress", "high", id.nora, 9],
  ["Migrate build pipeline to EAS", "MOB", "todo", "low", id.daniel, 17],
  ["Regression pass on Android 15", "MOB", "todo", "medium", id.sofia, 12],

  ["Book the paid social budget", "MKT", "completed", "high", id.liam, -8],
  ["Write lifecycle email sequence", "MKT", "in-progress", "medium", id.priya, 4],
  ["Build campaign attribution report", "MKT", "todo", "high", id.liam, 7],
  ["Produce launch video cutdowns", "MKT", "in-review", "medium", id.sofia, 1],
  ["Review partner blog placements", "MKT", "todo", "low", id.priya, 10],
  ["Set up UTM naming convention", "MKT", "completed", "medium", id.liam, -3],

  ["Model proration on plan change", "BIL", "in-progress", "urgent", id.kenji, 6],
  ["Invoice PDF redesign", "BIL", "in-review", "medium", id.daniel, 3],
  ["Add usage metering to API gateway", "BIL", "todo", "high", id.kenji, 14],
  ["Backfill historical invoices", "BIL", "todo", "medium", id.kenji, 19],
  ["Dunning emails for failed payments", "BIL", "in-progress", "high", id.maya, 8],
  ["Localise billing strings (DE, FR)", "BIL", "todo", "low", id.priya, 24],
  ["Tax rate lookup integration", "BIL", "todo", "medium", id.daniel, 27],

  ["Interview five portal power users", "POR", "in-progress", "high", id.nora, 2],
  ["Draft saved-views information architecture", "POR", "in-review", "medium", id.maya, -1],
  ["Prototype audit log export", "POR", "todo", "medium", id.tom, 4],
  ["Seat management API contract", "POR", "todo", "high", id.kenji, 5],
  ["Accessibility audit of portal forms", "POR", "todo", "low", id.sofia, 6],

  ["Inventory reporting queries", "DAT", "completed", "medium", id.kenji, -10],
  ["Size the new warehouse cluster", "DAT", "todo", "urgent", id.daniel, 22],
  ["Map legacy report dependencies", "DAT", "todo", "high", id.liam, 29],
  ["Write backfill runbook", "DAT", "todo", "medium", id.kenji, 36],

  ["Approve new wordmark", "BRD", "completed", "high", id.maya, -14],
  ["Update marketing site imagery", "BRD", "completed", "medium", id.priya, -11],
  ["Publish brand guidelines", "BRD", "completed", "low", id.nora, -9],

  ["Resolve flaky checkout test", "BIL", "in-progress", "urgent", id.sofia, -4],
  ["Fix calendar timezone drift", "POR", "todo", "urgent", id.tom, -2],
  ["Correct overdue badge contrast", "MOB", "in-progress", "high", id.priya, -1],
  ["Verify CSV export encoding", "DAT", "in-review", "medium", id.liam, 3],
]

export const seedTasks = seedTaskSeeds.map(
  ([title, projectKey, status, priority, assigneeUserId, dueOffset]) => ({
    title,
    projectKey,
    status,
    priority,
    assigneeUserId,
    dueDate: toISODate(dueOffset),
  })
)

export { toISODate }