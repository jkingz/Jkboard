# Code Standards

---

## General

- Imports use the `@/` alias, never relative paths across directories. `@/` maps to `./src/*`.
- `"use client"` only where interactivity requires it. Data access stays server-side; client
  components read from `useJkboard()`.
- Server-only modules (`src/db/index.ts`, `src/lib/auth.ts`, `src/db/actions/*.ts`) are marked
  `server-only` / `"use server"` and must not be imported from a client component.
- Comments explain **why**, not what. The existing codebase does this well — match it. A comment
  restating the code below it is noise.

---

## Language strictness

`tsconfig.json`: `strict: true`, `noEmit: true`, `isolatedModules: true`, `moduleResolution: "bundler"`,
`target: "ES2022"`, `allowJs: true`, `skipLibCheck: true`, `paths` for `@/*`.

Notably **not** enabled: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. The mutations lean
on explicit `...(x !== undefined && { x })` spreads rather than optional-property types — match that
idiom rather than introducing `as` casts.

---

## Framework rules

The conventions an agent from training data gets wrong in this pinned major version. See
[project-context.md](./project-context.md) → Framework version drift for the version pins; read
`node_modules/next/dist/docs/` before writing framework code.

- **`src/proxy.ts` exports `proxy`, not `middleware`.** `middleware.ts` is the deprecated filename in
  Next 16. Do not "fix" this back.
- **shadcn primitives are on Base UI** (`@base-ui/react`), not Radix. Their APIs are Base UI's.
- **`cn()` comes from the standalone `cn` package.** `clsx` and `tailwind-merge` are not installed;
  importing them fails.

---

## Error handling

- Server actions validate with Zod and throw `Error` carrying a user-readable message (e.g.
  `"Someone with that email is already in the workspace."`).
- **The client is the sanitising layer.** `src/data/jkboard-store.tsx` catches and re-wraps via
  `errorMessage(error, fallback)`, then rethrows a message safe to display. Internal stack traces
  never reach the UI — but that is by convention in one file, not by framework enforcement.
- A thrown `Error` in an action surfaces as a rejected promise on the client, which the store converts
  to `throw new Error(...)`. UI is expected to catch it.
- Nothing is logged server-side today. There is no error reporting hook; a caught-and-rethrown error
  leaves no trace beyond the browser console.

---

## HTTP handlers

There is exactly one, `src/app/api/auth/[...all]/route.ts`:

```ts
import { toNextJsHandler } from "better-auth/next-js"
import { auth } from "@/lib/auth"

export const { GET, POST } = toNextJsHandler(auth.handler)
```

All status and validation logic lives inside Better Auth. Jkboard does not hand-roll an auth
endpoint and must not.

- **Status precedence:** none is defined here — Better Auth owns it. Do not restate an order from
  memory.
- **Cache headers:** none set. `(dashboard)` is `force-dynamic`, so nothing under it is cached.

All other mutations are server actions, which have no HTTP surface of their own.

---

## Data access

- **Reads** live in `src/db/queries/jkboard.ts` only. It flattens joins into arrays so the UI never
  assembles relationships itself.
- **Writes** live in `src/db/actions/{projects,tasks,members}.ts` only.
- Both use the `db` handle from `src/db/index.ts`. No other module touches Drizzle.
- Every action ends with `revalidatePath("/", "layout")`.

---

## File organization

From `find`, not from ambition — see [project-context.md](./project-context.md) → Where logic goes
for the full tree.

---

## Testing

`/testing` is the source of truth for test organization, tier definitions, mocking, and how to run
tests.

**A runner exists** — Vitest with a `unit` and an `integration` tier, the unit tier wired into CI.
That does not relax the rule: do not report "tests pass" as coverage. Name the tier that ran, and say
what no tier reaches. Nothing renders a component, so `/verification-gates` keeps its mandatory live
browser exercise; nothing writes a row, so the integration tier proves schema shape, not action
behaviour.

The convention, now in force: tests in `tests/{feature}/{tier}/`, importing through `@/`, mocking at
the boundary in the unit tier only.

---

## Docs and truth

- **Code is the source of truth.** Where a doc and the code disagree, the doc is the defect, and you
  fix it in the same change.
- Do not restate a spec in a doc — link it.
- No rotting literals: quote command output instead of typing counts, versions or file paths from
  memory.
- Full standards for writing these docs: [verification-standards.md](./verification-standards.md).