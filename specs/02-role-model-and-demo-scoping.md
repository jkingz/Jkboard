# 02 — A role model, and a demo that cannot destroy

Blocked by Q1 and Q2 (`docs/product-overview.md:89-92`) and by spec 01.

## Goal

The credentials printed on `/landing` stop being a way to empty the workspace: a session identified
as the demo cannot delete a project, remove a member, or invite a new one.

## Why it is open

`src/lib/demo.ts:15,18` define `DEMO_EMAIL`/`DEMO_PASSWORD` and both are rendered on the public page
(`src/app/landing/components/hero-section.tsx:81-85`) and on the sign-in form
(`src/app/(auth)/sign-in/components/login-form.tsx:152-156`). No action checks a role (spec 01), and
there is no role to check: `member.role` is `text("role").notNull().default("Member")`
(`src/db/schema/members.ts:34`), the Better Auth `user` table has no role column
(`src/db/schema/auth.ts:14-27`), and `src/lib/auth.ts:105` loads `plugins: [nextCookies()]` — the admin
plugin is not installed. `isDemoEnvironment()` (`src/lib/demo.ts:34`) already gates which account the
UI treats as demo and is covered by `tests/platform/unit/demo-account.unit.test.ts`.

## First increment

1. Pick the model — this is the Q2 answer, written down before code:
   - **(a)** Better Auth admin plugin, role on `user`; least custom code, but it changes the auth
     schema and every session payload. **Read the installed plugin's docs in
     `node_modules/better-auth` before choosing this** — the repo pins 1.7.7 and the shape of
     `admin` has moved between versions.
   - **(b)** a real Postgres enum on `member.role`; stays in the app's own schema, costs a
     `pnpm db:generate` migration plus a plan for the live database — coordinate with spec 09.
2. Enforce at three entries only, all in `src/db/actions/`: `deleteProjectAction` (`projects.ts:159`),
   `removeMemberAction` (`members.ts:139`), `inviteMemberAction` (`members.ts:45`). One predicate,
   next to spec 01's guard, so there is one place to audit.
3. Refuse the way the actions already refuse: `throw new Error()` with a sentence a person can read —
   the pattern at `src/db/actions/members.ts:112` — which `errorMessage()`
   (`src/lib/error-message.ts:15`) already turns into the client's copy. Do not invent a result union.

## Later increments

- Hide the destructive affordances in the UI for a demo session rather than only refusing them — the
  row in `docs/verification-standards.md` about calling a warning a gate applies here: a button that
  always errors is not a permission model.
- Demo data reset, if the owner wants the demo writable. Read-only is the floor, not the ceiling.

## Deferred / open questions

- Q1: if each user gets their own workspace, the demo problem partly dissolves — a demo visitor then
  only mutates demo data. Do not start step 2 before that answer.
- Whether `role` should be one of Owner/Member/Viewer or free text kept for display is undecided.

## Security / permissions

Server-side only. The refusal must come from the action, not from the button being absent —
`src/proxy.ts` cannot help here, it only checks cookie presence.

Test: a structural assertion that the three actions branch on the predicate (same file as spec 01's
assertion), plus a behavioural test through spec 03 with a demo session fixture.

## Verification

- Gate chain, per spec 01.
- Live: sign in with the printed demo credentials in a production build, attempt a project delete,
  and observe the refusal — then confirm the project still appears after reload.
- Unverified until step 1 of spec 03 exists: that the refusal is the *only* path, i.e. that a crafted
  call cannot reach `db` another way.
