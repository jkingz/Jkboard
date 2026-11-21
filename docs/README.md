# docs/ — the project knowledge base

`AGENTS.md` holds the rules that apply to every change. Everything else lives here, one file per
concern, so that the file an agent must read is never larger than the question being asked.

## Map

| File | Read it when | Fill it |
| --- | --- | --- |
| [product-overview.md](./product-overview.md) | you need to know what the project is for and what is out of scope | at the first product decision |
| [architecture.md](./architecture.md) | you are about to touch data, routes, auth or a cross-cutting rule | after the first real commit, then on every change to the surface |
| [code-standards.md](./code-standards.md) | you are writing code | as conventions get decided |
| [ui.md](./ui.md) | the change touches the interface | as the design system settles |
| [target-state.md](./target-state.md) | the change builds something that does not exist yet | whenever design intent outpaces code |
| [project-context.md](./project-context.md) | you need commands, gates, env vars or protected paths | day one, then as they change |

## The one rule

**Code is the source of truth.** When implementation and docs disagree, the doc is the defect. Fix it
in the same change you fix the code.

## Two rules specific to this folder

1. **Implemented and planned never share a document.** A line that reads as current behavior must be
   true today. Design intent goes in [target-state.md](./target-state.md).
2. **A sentence earns its place only if its author read the thing this session.**

## Folder layout

```
AGENTS.md              rules 1–10, and this index
docs/                  project knowledge, one file per concern
```

`tests/` exists with two tiers — see [project-context.md](./project-context.md) → Verification gates.
`.github/workflows/ci.yml` runs the gate chain on push; it runs the unit tier only.

## Health check

```bash
grep -rn '<[a-zA-Z_/]' docs/ AGENTS.md
```

Every hit is an unfilled slot. Zero hits means the docs are done.