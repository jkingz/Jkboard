import { describe, expect, it } from "vitest"

import {
  exportedAsyncFunctions,
  functionBody,
  importsOf,
  isServerActionModule,
  readSource,
  sourceFiles,
} from "./helpers"

/**
 * Two invariants over the same set of files, checked structurally:
 *
 * - **Invariant 4** — every mutation ends in `revalidatePath("/", "layout")`.
 *   Omitting it does not throw; the client context keeps showing the pre-write
 *   data and there is nothing to trace. It was one of the three invariants the
 *   docs recorded as "remains a hope".
 * - **The caller is identified before anything is written** — every mutation
 *   calls `requireMembership()`, and calls it ahead of its first database
 *   access. Added by `specs/01`; before it, an anonymous POST to an action's
 *   generated route reached `db.delete()` with nothing in between.
 *
 * Both are structural checks, not execution checks, for the same reason the
 * boundary test is: `src/db/actions/*.ts` is `server-only`, so a test process
 * outside a React Server Component graph cannot import it and call it. A
 * behavioural test needs a disposable database — see `docs/target-state.md` →
 * "Behavioural tests for the server actions".
 */

/** The guard module the mutations call. It is not an action, so it is not one of the three. */
const GUARD_MODULE = "src/db/actions/session.ts"
const GUARD = "requireMembership"

const ACTION_MODULES = sourceFiles("src/db/actions").filter(
  (file) => file !== GUARD_MODULE
)

/** The exact argument pair the invariant names. Nothing narrower is allowed. */
const REVALIDATE = 'revalidatePath("/", "layout")'

/**
 * Reads, not mutations: they write nothing, so requiring revalidation of them
 * would be wrong. Both are also recorded as dead exports in
 * `docs/target-state.md` → "Wiring or deleting countOwnedProjects /
 * assertMemberExists"; this list is where that claim is checked.
 */
const READ_ONLY_EXPORTS: string[] = []

/** Actions grouped by the module that declares them. */
const actionsByModule = new Map(
  ACTION_MODULES.map((file) => [
    file,
    exportedAsyncFunctions(readSource(file)).filter((name) => name.endsWith("Action")),
  ])
)

const allActionNames = new Set([...actionsByModule.values()].flat())

/**
 * Bodies of every mutation, keyed by export name. Read once; both invariants
 * below trace over it.
 */
const bodiesOf = new Map<string, string | null>()
for (const file of ACTION_MODULES) {
  const source = readSource(file)
  for (const name of actionsByModule.get(file) ?? []) {
    bodiesOf.set(name, functionBody(source, name))
  }
}

const bodyOf = (name: string) => bodiesOf.get(name) ?? null

const callsGuard = (body: string) => new RegExp(`\\b${GUARD}\\s*\\(`).test(body)

/**
 * The mutations where `holds` is true, either directly or through an action they
 * delegate to. `setTaskStatusAction` is exactly that case — it is a one-line
 * wrapper around `updateTaskAction`, which both revalidates and guards.
 *
 * Traced to a fixed point instead of recursing, so a delegation cycle between
 * two actions cannot hang the suite: the cycle simply never satisfies and fails.
 */
function actionsMeeting(holds: (body: string) => boolean) {
  const satisfied = new Set<string>()
  let grew = true

  while (grew) {
    grew = false
    for (const name of allActionNames) {
      if (satisfied.has(name)) continue
      const body = bodyOf(name)
      if (!body) continue

      const direct = holds(body)
      const viaDelegate = [...allActionNames].some(
        (other) =>
          other !== name &&
          satisfied.has(other) &&
          new RegExp(`\\b${other}\\s*\\(`).test(body)
      )

      if (direct || viaDelegate) {
        satisfied.add(name)
        grew = true
      }
    }
  }

  return satisfied
}

describe("invariant 4: every mutation revalidates the layout", () => {
  it("the three action modules are the whole write surface", () => {
    expect(ACTION_MODULES.map((f) => f.split("/").pop())).toEqual([
      "members.ts",
      "projects.ts",
      "tasks.ts",
    ])
    // The directory holds one file more: the guard those three call. Asserted as
    // the full listing so a fourth module cannot hide behind the filter above.
    expect(sourceFiles("src/db/actions").map((f) => f.split("/").pop())).toEqual([
      "members.ts",
      "projects.ts",
      GUARD_MODULE.split("/").pop(),
      "tasks.ts",
    ])
    expect([...allActionNames].sort()).toEqual([
      "createProjectAction",
      "createTaskAction",
      "deleteProjectAction",
      "deleteTaskAction",
      "duplicateTaskAction",
      "inviteMemberAction",
      "removeMemberAction",
      "setMemberStatusAction",
      "setProjectStatusAction",
      "setTaskStatusAction",
      "updateProjectAction",
      "updateTaskAction",
    ])
  })

  it("every exported async function is either an action or a declared read", () => {
    const others = ACTION_MODULES.flatMap((file) =>
      exportedAsyncFunctions(readSource(file)).filter((name) => !name.endsWith("Action"))
    )

    expect(others.sort()).toEqual([...READ_ONLY_EXPORTS].sort())
  })

  it("each mutation revalidates, directly or through the action it delegates to", () => {
    const satisfied = actionsMeeting((body) => body.includes(REVALIDATE))
    const missing = [...allActionNames].filter((name) => !satisfied.has(name))

    expect(missing, `no ${REVALIDATE} reachable from: ${missing.join(", ")}`).toEqual([])
  })

  it("nothing revalidates a narrower path than the whole layout", () => {
    // A per-route revalidate would leave the other dashboard pages stale, and
    // `docs/architecture.md` records that no cache tags exist anywhere.
    const calls = ACTION_MODULES.flatMap((file) =>
      [...readSource(file).matchAll(/revalidatePath\(([^\n]*)\)/g)].map((m) => m[1].trim())
    )

    expect(calls.length).toBeGreaterThan(0)
    expect([...new Set(calls)]).toEqual(['"/", "layout"'])
  })

  it("the client half refreshes the router on every action it awaits", () => {
    const store = readSource("src/data/jkboard-store.tsx")
    const actionCalls = [...store.matchAll(/\bawait\s+([a-zA-Z]+Action)\s*\(/g)].map((m) => m[1])
    const finallyBlocks = [...store.matchAll(/finally\s*\{([\s\S]*?)\}/g)].map((m) => m[1])

    // Every awaited name is an action the server modules actually export.
    for (const name of actionCalls) expect(allActionNames.has(name), name).toBe(true)

    expect(actionCalls.length).toBe(12)
    expect(finallyBlocks.length).toBe(actionCalls.length)
    for (const block of finallyBlocks) expect(block).toContain("router.refresh()")
  })

  it("the store awaits each action exactly once, so the counts above mean what they say", () => {
    const store = readSource("src/data/jkboard-store.tsx")
    const calls = [...store.matchAll(/\bawait\s+([a-zA-Z]+Action)\s*\(/g)].map((m) => m[1])

    expect(new Set(calls).size).toBe(calls.length)
  })
})

describe("every mutation identifies its caller", () => {
  it("each mutation reaches the guard, directly or through the action it delegates to", () => {
    const satisfied = actionsMeeting(callsGuard)
    const missing = [...allActionNames].filter((name) => !satisfied.has(name))

    expect(missing, `no ${GUARD}() reachable from: ${missing.join(", ")}`).toEqual([])
  })

  it("a mutation that calls the guard itself calls it before touching the database", () => {
    // Guarding after the write satisfies the test above and protects nothing,
    // so the order — not merely the presence — is what this pins.
    const direct = [...allActionNames].filter((name) => {
      const body = bodyOf(name)
      return body !== null && callsGuard(body)
    })

    // Twelve mutations, one of which (`setTaskStatusAction`) inherits.
    expect(direct.length).toBe(11)

    for (const name of direct) {
      const body = bodyOf(name) as string
      const guard = body.search(new RegExp(`await\\s+${GUARD}\\s*\\(`))
      const write = body.search(/\bdb\s*\./)

      expect(guard, `${name} never awaits the guard`).toBeGreaterThanOrEqual(0)

      if (write !== -1) {
        expect(guard, `${name} reaches the database before the guard`).toBeLessThan(write)
      }
    }
  })

  it("the guard is an imported helper, not an action endpoint of its own", () => {
    const source = readSource(GUARD_MODULE)

    expect(exportedAsyncFunctions(source)).toEqual([GUARD])

    // `"use server"` would publish every export as a callable route. The guard
    // is only ever reached through the actions that import it.
    expect(isServerActionModule(source), `${GUARD_MODULE} must not be "use server"`).toBe(
      false
    )

    const bare = importsOf(source).filter((imp) => imp.clause === "").map((imp) => imp.spec)
    expect(bare).toContain("server-only")
  })

  it("identity comes from the session, never from a position in the member list", () => {
    const layout = readSource("src/app/(dashboard)/layout.tsx")
    const shell = readSource("src/app/(dashboard)/components/dashboard-shell.tsx")
    const store = readSource("src/data/jkboard-store.tsx")
    const queries = readSource("src/db/queries/jkboard.ts")

    // The layout addresses the session user, and the row travels down as a prop.
    expect(layout).toContain("getMemberByUserId(session.user.id)")
    expect(shell).toContain("currentMember={currentMember}")
    expect(store).toMatch(/currentMember:\s*Member/)

    // `currentMember: members[0]` was the earliest `joinedAt` in the table, so it
    // named the same person for every caller. No positional identity may return.
    expect(/currentMember:\s*members\[\d+\]/.test(store)).toBe(false)

    // The read that made that possible is gone as an export (prose about it in
    // the docblock above is not a caller).
    const queryExports = exportedAsyncFunctions(queries)
    expect(queryExports).toContain("getMemberByUserId")
    expect(queryExports).not.toContain("getMemberId")
  })
})
