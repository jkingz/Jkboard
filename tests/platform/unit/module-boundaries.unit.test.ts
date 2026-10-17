import { describe, expect, it } from "vitest"

import {
  importsOf,
  isClientModule,
  isServerActionModule,
  readSource,
  resolvesTo,
  sourceFiles,
} from "./helpers"

/**
 * Invariant 1 from `docs/architecture.md`: **the database is never imported from
 * a client component.** Violating it does not fail loudly — it bundles the
 * connection string and the auth secret into a browser chunk. `docs` called
 * this "a build-time guarantee" with no test behind it; this is that test.
 *
 * It reads the source tree rather than the runtime graph on purpose. The
 * `server-only` marker in `src/db/index.ts` is the *other* half of the guarantee
 * and cannot be exercised from a test process that is not inside a React Server
 * Component graph, so both halves are asserted structurally.
 */

/**
 * Modules whose value import ships server code (or its credentials) to the
 * browser. `@/lib/auth` is listed but `@/lib/auth-client` is not: the client
 * instance is the sanctioned way for a component to reach Better Auth.
 *
 * `@/db/actions/*` is deliberately **absent**. Server actions are the app's only
 * write path and are designed to be called from the client; the connection
 * handle, the schema and the query layer are not.
 */
const SERVER_ONLY_EXACT = ["@/db", "@/lib/auth", "server-only"]
const SERVER_ONLY_PREFIXES = [
  "@/db/schema",
  "@/db/queries",
  "drizzle-orm",
  "@neondatabase/serverless",
  "better-auth/cookies",
  "better-auth/server",
  "next/headers",
]

function isServerOnlyImport(spec: string) {
  return (
    SERVER_ONLY_EXACT.includes(spec) ||
    SERVER_ONLY_PREFIXES.some((prefix) => spec === prefix || spec.startsWith(`${prefix}/`))
  )
}

/**
 * `src/data/jkboard-store.tsx` is the only client module allowed to reach the
 * actions, which is what keeps the "every mutation goes through the store"
 * claim in `docs/architecture.md` true rather than aspirational.
 */
const ACTION_GATEWAY = "src/data/jkboard-store.tsx"

/**
 * The hardcoded seed arrays are sample data, not the workspace
 * (`docs/architecture.md` → "Stale hardcoded data", and
 * `docs/target-state.md` → "Removing the seed arrays").
 * `product-preview.tsx` is the one legitimate reader: it is a marketing
 * mock-up of the board, and its whole point is to show data that is not yours.
 */
const SEED_ARRAYS = ["members", "projects", "tasks", "taskSeeds"]
const SEED_ARRAY_EXCEPTIONS = ["src/app/landing/components/product-preview.tsx"]

const clientModules = sourceFiles().filter((file) => isClientModule(readSource(file)))

describe("invariant 1: server-only modules stay off the client", () => {
  it("the client boundary is measured against the real tree, not an empty list", () => {
    // If the walker or the directive test broke, every other test in this file
    // would pass vacuously. This one cannot.
    expect(clientModules.length).toBeGreaterThan(80)
    expect(clientModules).toContain("src/data/jkboard-store.tsx")
    expect(clientModules).toContain("src/app/(dashboard)/components/dashboard-shell.tsx")
  })

  it("no client module value-imports the database or the server auth instance", () => {
    const violations: Array<string> = []

    for (const file of clientModules) {
      const source = readSource(file)

      for (const imp of importsOf(source)) {
        // `import type { WorkspaceData } from "@/db/queries/jkboard"` is erased
        // at build time and ships nothing, so the type layer is not a leak.
        if (imp.typeOnly) continue
        if (isServerOnlyImport(imp.spec)) {
          violations.push(`${file} -> ${imp.spec}`)
        }
      }
    }

    expect(violations).toEqual([])
  })

  it("the store's only non-action reach into @/db is a type import", () => {
    const dbImports = importsOf(readSource("src/data/jkboard-store.tsx")).filter((imp) =>
      resolvesTo(imp.spec, "@/db")
    )

    expect(dbImports.length).toBeGreaterThan(0)

    const nonAction = dbImports.filter((imp) => !resolvesTo(imp.spec, "@/db/actions"))
    expect(nonAction.map((imp) => imp.spec)).toEqual(["@/db/queries/jkboard"])
    // The exemption that keeps `WorkspaceData` legal: it is erased at build time.
    expect(nonAction.every((imp) => imp.typeOnly)).toBe(true)
  })

  it("only the store imports the server actions", () => {
    const importers = sourceFiles()
      .filter((file) => !file.startsWith("src/db/"))
      .filter((file) =>
        importsOf(readSource(file)).some((imp) => resolvesTo(imp.spec, "@/db/actions"))
      )

    expect(importers).toEqual([ACTION_GATEWAY])
  })

  it("src/db/index.ts and src/lib/auth.ts both declare server-only", () => {
    for (const file of ["src/db/index.ts", "src/lib/auth.ts"]) {
      const bare = importsOf(readSource(file)).filter((imp) => imp.clause === "")
      expect(bare.map((imp) => imp.spec), file).toContain("server-only")
    }
  })

  it("src/db/actions holds the guard and three server-action modules", () => {
    const actionModules = sourceFiles("src/db/actions")

    expect(actionModules.map((file) => file.split("/").pop())).toEqual([
      "members.ts",
      "projects.ts",
      // `specs/01`: the session guard every mutation calls.
      "session.ts",
      "tasks.ts",
    ])

    for (const file of actionModules.filter((file) => !file.endsWith("session.ts"))) {
      expect(isServerActionModule(readSource(file)), file).toBe(true)
    }

    // The guard is a helper the actions import, not an action: `"use server"`
    // would publish it as its own callable route.
    expect(isServerActionModule(readSource("src/db/actions/session.ts"))).toBe(false)
  })

  it("no client module buries its directive below the imports, where Next would ignore it", () => {
    const misplaced = sourceFiles().filter((file) => {
      const source = readSource(file)
      return !isClientModule(source) && /^["']use client["']/m.test(source)
    })

    expect(misplaced).toEqual([])
  })
})

describe("the seed arrays are sample data, not the workspace", () => {
  it("nothing outside the marketing preview imports members, projects or tasks", () => {
    const importers: Array<string> = []

    for (const file of sourceFiles()) {
      if (file === "src/data/jkboard.ts") continue

      for (const imp of importsOf(readSource(file))) {
        if (!resolvesTo(imp.spec, "@/data/jkboard") || imp.typeOnly) continue

        const named = imp.clause
          .replace(/^\{|\}$/g, "")
          .split(",")
          .map((entry) => entry.trim().split(/\s+as\s+|:/)[0])
          .filter((entry) => entry && !entry.startsWith("type "))

        if (named.some((entry) => SEED_ARRAYS.includes(entry))) importers.push(file)
      }
    }

    expect(importers).toEqual(SEED_ARRAY_EXCEPTIONS)
  })
})
