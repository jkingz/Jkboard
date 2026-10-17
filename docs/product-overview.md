# Product Overview

> Written from decisions, not wishes. Every fact below is a requirement someone stated. If you cannot
> name who asked for it, it belongs in [target-state.md](./target-state.md) instead.

---

## Status

**Built** — email/password sign-up and sign-in; **public demo access with credentials printed on the
landing page and sign-in form**, plus a one-click "Try the live demo" button; one shared workspace
loaded server-side; projects
with CRUD, status and membership; tasks with CRUD, status, priority, assignee, due date, duplicate and
drag-and-drop ordering; kanban board per project; filterable/sortable task table; deadline calendar;
team page with invite / status / remove; dashboard with stats, charts, recent projects and tasks;
marketing landing page; light/dark theming with a runtime theme customizer.

**Not built** — verified by reading the code, not assumed:

- **Multi-tenancy / per-user scoping.** There is exactly one workspace: `getWorkspaceData()`
  (`src/db/queries/jkboard.ts:90`) selects `project`, `task` and `member` with no `where` clause at all.
  Identity is resolved from the session — `currentMember` is whoever signed in, not whoever joined first
  — but nothing is scoped by it, so every signed-in account sees and can mutate the same data.
- **Authorization.** No role check guards any mutation. `role` is a free-text column with default
  `"Member"`; nothing branches on it. Every action now awaits `requireMembership()` first, so an
  *unsigned* caller is refused, but any signed-in session can still delete any project by id. Combined
  with public demo credentials, that means a visitor can empty the demo workspace.
- **Email delivery.** `inviteMemberAction` creates the `user` + `member` rows and stops. No message is
  sent; the invitee must already know to sign in.
- **Tests.** A unit tier and a read-only integration tier exist and run, but there is **no e2e tier** —
  nothing renders the interface, and no test has ever written a row, so the server actions are unverified
  behaviourally.
- **Settings are static.** `settings/billing` reads from `data/*.json` files committed to the repo.
  `settings/user`, `settings/account`, `settings/notifications`, `settings/connections` have no
  persistence.
- **Deployment.** CI runs the gate chain on push, unit tier only. No deployment target is configured.

Verified: 2026-10-15, against the repo at `a70a95d`.

---

## Overview

Jkboard is a project and task management dashboard for a single team: create projects, break them
into tasks, and track who is assigned what and when it is due. It grew out of a shadcn
dashboard/landing template; the template supplied the shell (sidebar, theming, landing page, settings
pages) and Jkboard supplied the auth, Postgres data layer, and the actual project/task domain.

---

## Goals

None recorded. No owner has stated an outcome, and none is invented here. Everything above under
**Built** is capability, not goal.

---

## Core user flow

1. `/` → client-side `router.replace("/landing")` → `/sign-up` → `(dashboard)/layout.tsx` verifies the
   session → `/dashboard`.

---

## Scope

**In scope:**

- Single-workspace project and task tracking.
- The dashboard shell and landing page inherited from the template.

**Out of scope:**

- Multi-tenancy and row-level authorization — the schema has no tenant column, and adding one is a
  migration plus a rewrite of every query, not a feature.
- Billing — the billing page is static template JSON; wiring a provider is undecided.

---

## Success criteria

None recorded. No owner has stated a measurable target, so none is written here.

---

## Open product questions

A guessed answer here is a defect. An unanswered question is fine; an invented answer is not.

- Should `role` become real authorization, or is Jkboard intentionally a single-trust-team tool?
- Should invites send email, or is "sign in with the address you were invited with" the intended flow?
- Which settings pages are meant to persist, and which are permanent template decoration?
- Is one shared workspace the intended product, or an artifact of how far the build has got?