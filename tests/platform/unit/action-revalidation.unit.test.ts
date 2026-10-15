import { describe, expect, it } from "vitest"

import { exportedAsyncFunctions, functionBody, readSource, sourceFiles } from "./helpers"

/**
 * Invariant 4 from `docs/architecture.md`: **every mutation ends in
 * `revalidatePath("/", "layout")`**. Omitting it does not throw — the client
 * context keeps showing the pre-write data and there is nothing to trace. It was
 * one of the three invariants the docs recorded as "remains a hope".
 *
 * This is a structural check, not an execution check, for the same reason the
 * boundary test is: `src/db/actions/*.ts` is `server-only`, so a test process
 * outside a React Server Component graph cannot import it and call it. A
 * behavioural test needs a disposable database — see `docs/target-state.md` →
 * "Behavioural tests for the server actions".
 */

const ACTION_MODULES = sourceFiles("src/db/actions")

/** The exact argument pair the invariant names. Nothing narrower is allowed. */
const REVALIDATE = 'revalidatePath("/", "layout")'

/**
 * Reads, not mutations: they write nothing, so requiring revalidation of them
 * would be wrong. Both are also recorded as dead exports in
 * `docs/target-state.md` → "Wiring or deleting countOwnedProjects /
 * assertMemberExists"; this list is where that claim is checked.
 */
const READ_ONLY_EXPORTS = ["countOwnedProjects", "assertMemberExists"]

/** Actions grouped by the module that declares them. */
const actionsByModule = new Map(
  ACTION_MODULES.map((file) => [
    file,
    exportedAsyncFunctions(readSource(file)).filter((name) => name.endsWith("Action")),
  ])
)

const allActionNames = new Set([...actionsByModule.values()].flat())

/**
 * True when a mutation revalidates, either directly or through an action it
 * delegates to. `setTaskStatusAction` is exactly that case — it is a one-line
 * wrapper around `updateTaskAction`, and revalidation there covers it.
 *
 * Traced to a fixed point instead of recursing, so a delegation cycle between
 * two actions cannot hang the suite: the cycle simply never gains revalidation
 * and fails.
 */
function revalidatingActions(bodyOf: (name: string) => string | null) {
  const satisfied = new Set<string>()
  let grew = true

  while (grew) {
    grew = false
    for (const name of allActionNames) {
      if (satisfied.has(name)) continue
      const body = bodyOf(name)
      if (!body) continue

      const direct = body.includes(REVALIDATE)
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
    const bodies = new Map<string, string | null>()
    for (const file of ACTION_MODULES) {
      const source = readSource(file)
      for (const name of actionsByModule.get(file) ?? []) {
        bodies.set(name, functionBody(source, name))
      }
    }

    const satisfied = revalidatingActions((name) => bodies.get(name) ?? null)
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
