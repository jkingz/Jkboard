# 07 — Settings: persist or delete

Blocked by Q3 (`docs/product-overview.md:91`): which settings pages are meant to persist.

## Goal

Every settings route either writes real rows or does not exist. No form that looks like it saved and
saved nothing.

## Current state, read per page

| Route | What it actually does |
| --- | --- |
| `settings/user` | Local state with hardcoded defaults; `onSubmit` calls `toast.add` (`src/app/(dashboard)/settings/user/page.tsx:75-76,115`). No action, no read. |
| `settings/account` | Password form validated client-side only, submit shows a toast, "Delete account" shows a toast. Reads `currentMember` for display. |
| `settings/billing` | Renders two committed files: `./data/current-plan.json` and `./data/billing-history.json` (`page.tsx:17-18`). Plan selection is local state. |
| `settings/connections` | Integration toggles and API keys in React state; reads `currentMember` for display. |
| `settings/notifications` | Preferences form validated client-side, submit shows a toast (`page.tsx:145`). |

None of the five calls anything under `src/db/actions/`. Verified by reading each page.

## First increment

1. One owner line per route: **persist** or **delete**.
2. Delete first where the answer is delete — the route directory, its entry in the settings group of
   `src/components/app-sidebar.tsx`, and any component only it imported. Deleting is smaller than
   building and it removes a false claim from the interface.
3. For anything kept, name the table and the column before naming the form. `member` has no `name` or
   `email` column (`docs/architecture.md` → Persistence schema): identity lives in `user`, which
   Better Auth owns, so a "profile" write is an auth-table write and needs its own decision.

## Later increments

- `settings/account` password change: only meaningful after spec 08 exists, because changing a
  password without email delivery strands a user who forgets the new one.
- Billing: `docs/product-overview.md:75` records the provider as undecided. Until then the page is
  decoration and the honest move is deletion, not a stub.

## Deferred / open questions

- Q3, and with it: does a `user_settings`-shaped table belong in this schema at all, or are
  preferences part of `member`?
- Whether the demo account should be able to change settings. Depends on spec 02.

## Security / permissions

Any settings write goes through the same guard as spec 01 — a settings action is exactly the kind of
mutation an unauthenticated POST would love to find.

## Verification

- After deletions: grep for each deleted segment — `settings/user`, `settings/account`,
  `settings/billing`, `settings/connections`, `settings/notifications` — across `src/` returns nothing
  outside the deleted tree, and the route disappears from the `pnpm build` route table.
- After any persistence: the write is covered by spec 03's tier, not just by the form rendering.
- Live: sign in, change a value, reload, confirm it survived — the reload is the whole test.
