import { readdirSync, readFileSync } from "node:fs"
import { posix } from "node:path"

/**
 * Unit-tier helpers.
 *
 * The unit tier is "no database, no network" (`tests/README.md`), which also
 * makes it the only tier CI runs. Three of the six architecture invariants
 * (1, 4 and 5) are properties of the *source tree* or of pure request handling,
 * so they can be pinned here without booting Postgres or a browser.
 *
 * These helpers read `src/` off disk. That is deliberate: the guarantees being
 * tested are about which module imports what, which no runtime test can observe
 * without executing every module — including the `server-only` ones that throw
 * outside a React Server Component graph.
 */

/** Repo-relative paths always start here, so failure messages match `git ls-files`. */
const SRC = "src"

/** Reads a file addressed by the repo-relative path `sourceFiles` returned. */
export function readSource(repoPath: string) {
  return readFileSync(repoPath, "utf8")
}

/**
 * Every `.ts`/`.tsx` file under `subdir`, as repo-relative POSIX paths, sorted —
 * the address `readSource` takes and the address a test failure should print.
 * Paths are resolved against the repo root, which is where the test process runs.
 */
export function sourceFiles(subdir = SRC) {
  const out: string[] = []

  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name)
    )) {
      const child = posix.join(current, entry.name)
      if (entry.isDirectory()) walk(child)
      else if (/\.tsx?$/.test(child)) out.push(child)
    }
  }

  walk(subdir)
  return out
}

/**
 * A file is a client module when its first non-empty line is the
 * `"use client"` directive. Next.js requires the directive to precede every
 * import, and a directive buried mid-file is silently inert, so "first line" is
 * both the real rule and the strict reading of it.
 */
export function isClientModule(source: string) {
  return firstStatementLine(source) === '"use client"'
}

export function isServerActionModule(source: string) {
  return firstStatementLine(source) === '"use server"'
}

function firstStatementLine(source: string) {
  return source.split("\n").find((line) => line.trim() !== "")?.trim() ?? ""
}

export interface ImportStatement {
  /** The module specifier, without quotes. */
  spec: string
  /** Everything between `import` and `from` — empty for a bare `import "x"`. */
  clause: string
  /** `import type { … }`, which is erased at build time and ships nothing. */
  typeOnly: boolean
}

/**
 * A line-scanning import parser, not a regex. The repo omits semicolons and
 * wraps long specifier lists, so a single regex either stops at a newline or
 * swallows the bare `import "server-only"` on the line above.
 */
export function importsOf(source: string): Array<ImportStatement> {
  const lines = source.split("\n")
  const out: Array<ImportStatement> = []

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (!trimmed.startsWith("import")) continue

    let text = trimmed
    let j = i
    while (
      !/from\s+["'][^"']+["']\s*$/.test(text) &&
      !/^import\s+["'][^"']+["'];?$/.test(text) &&
      j + 1 < lines.length
    ) {
      j += 1
      text += `\n${lines[j].trim()}`
    }
    i = j

    const withFrom = text.match(/from\s+["']([^"']+)["']/)
    const bare = text.match(/^import\s+["']([^"']+)["'];?$/)

    if (withFrom) {
      out.push({
        spec: withFrom[1],
        clause: text.slice(text.indexOf("import") + "import".length, withFrom.index).trim(),
        typeOnly: text.slice(text.indexOf("import") + 6).trim().startsWith("type "),
      })
    } else if (bare) {
      out.push({ spec: bare[1], clause: "", typeOnly: false })
    }
  }

  return out
}

/** True when `spec` is the module itself or lives beneath it. */
export function resolvesTo(spec: string, modulePath: string) {
  return spec === modulePath || spec.startsWith(`${modulePath}/`)
}

/**
 * Extracts a top-level function body by brace matching, from `export … name(`
 * to the line whose closing brace returns it to column 0.
 *
 * Used instead of importing the module: `src/db/actions/*.ts` is `server-only`
 * and cannot be imported under plain Node (see the same constraint in the
 * integration tier).
 */
export function functionBody(source: string, name: string) {
  const start = source.search(new RegExp(`^export\\s+async\\s+function\\s+${name}\\s*\\(`, "m"))
  if (start === -1) return null

  const open = source.indexOf("{", source.indexOf(")", start))
  if (open === -1) return null

  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth += 1
    else if (source[i] === "}") {
      depth -= 1
      if (depth === 0) return source.slice(start, i + 1)
    }
  }

  return null
}

/** Names of every top-level `export async function` in a module. */
export function exportedAsyncFunctions(source: string) {
  return [...source.matchAll(/^export\s+async\s+function\s+([A-Za-z0-9_]+)/gm)].map(
    (m) => m[1]
  )
}
