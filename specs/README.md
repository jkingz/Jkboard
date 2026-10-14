# Feature Specs

One file per feature or deliverable unit of work.

## Naming convention

- `01-feature-name.md` — numbered in implementation order
- `00-template.md` — copy this for new specs

## Structure

Each spec describes:
- **Goal** — observable outcome
- **Increments** — implementation phases
- **Open questions** — unresolved decisions
- **Security** — auth/permissions model
- **Verification** — how to prove it works

Specs live here; implementations live in the codebase. When a spec and code disagree, code is truth.

See [docs/project-context.md](../docs/project-context.md) for the commands and gates, and
[docs/architecture.md](../docs/architecture.md) for how the system works today. Design intent that is
not built belongs in [docs/target-state.md](../docs/target-state.md).
