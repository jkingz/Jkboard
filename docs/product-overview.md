# Product Overview

> Written from decisions, not wishes. Every fact below is a requirement someone stated. If you cannot
> name who asked for it, it belongs in [target-state.md](./target-state.md) instead.

---

## Status

**Built** — email/password sign-up and sign-in; one shared workspace loaded server-side; projects
with CRUD, status and membership; tasks with CRUD, status, priority, assignee, due date, duplicate and
drag-and-drop ordering; kanban board per project; filterable/sortable task table; deadline calendar;
team page with invite / status / remove; dashboard with stats, charts, recent projects and tasks;
marketing landing page; light/dark theming with a runtime theme customizer.

**Not built** — verified by reading the code, not assumed:

- **Multi-tenancy / per-user scoping.** There is exactly one workspace. `getMemberId()`
  (`src/db/queries/flowboard.ts:123`) returns the *first* `member` row, and `currentMember` is
  hardcoded to `members[0]` (`src/data/flowboard-store.tsx:308`). Every signed-in user sees and can
  mutate the same data.
- **Authorization.** No role check guards any mutation. `role` is a free-text column with default
  `"Member"`; nothing branches on it. Any authenticated session can delete any project.
- **Email delivery.** `inviteMemberAction` creates the `user` + `member` rows and stops. No message is
  sent; the invitee must already know to sign in.
- **Tests.** No runner, no files.
- **Settings are static.** `settings/billing` reads from `data/*.json` files committed to the repo.
  `settings/user`, `settings/account`, `settings/notifications`, `settings/connections` have no
  persistence.
- **Deployment.** No remote, no CI.

Verified: 2026-10-15, against the repo at `a70a95d`.

---

## Overview

FlowBoard is a project and task management dashboard for a single team: create projects, break them
into tasks, and track who is assigned what and when it is due. It grew out of a shadcn
dashboard/landing template; the template supplied the shell (sidebar, theming, landing page, settings
pages) and FlowBoard supplied the auth, Postgres data layer, and the actual project/task domain.

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

- Should `role` become real authorization, or is FlowBoard intentionally a single-trust-team tool?
- Should invites send email, or is "sign in with the address you were invited with" the intended flow?
- Which settings pages are meant to persist, and which are permanent template decoration?
- Is one shared workspace the intended product, or an artifact of how far the build has got?