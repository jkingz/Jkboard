# 08 — Email: invite, verification, password reset

Blocked by Q2 and Q4 (`docs/product-overview.md:90-91`) and by a provider decision plus a secret.

## Goal

An invited address receives something usable, and an address in the database is verified or is not —
never both at once.

## Why it is open

- `inviteMemberAction` (`src/db/actions/members.ts:46`) inserts a `user` row (`:65-73`) and a `member`
  row (`:77-84`), revalidates (`:88`), and stops. The invitee has to already know to sign in.
- The interface already promises otherwise: `src/app/(dashboard)/users/components/team-table.tsx:293`
  renders a **"Resend invite"** control, and `src/components/sidebar-notification.tsx:41` tells the
  user to "resend their invitation". Nothing is ever sent, so both are dead affordances.
- `user.email_verified` is `boolean("email_verified").default(false).notNull()`
  (`src/db/schema/auth.ts:18`) and nothing sets it to true, so the column is a permanent lie about
  every account.
- There is no transport configured: `.env.example` defines exactly three variables — `DATABASE_URL`,
  `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` — and a grep for `smtp|resend|sendgrid|mailgun|nodemailer`
  across `src/` and `scripts/` matches only the two UI strings above.
- `src/lib/auth.ts:105` loads `plugins: [nextCookies()]`; no email or OTP plugin is installed, and
  there is no `databaseHooks` for sending.

## First increment

1. Choose the transport and record its variable name in `docs/project-context.md` → Environment
   before writing code. Per AGENTS.md rule 6 the doc carries the name and an empty placeholder only.
2. Read the installed Better Auth's own docs for the send hooks rather than working from memory —
   `node_modules/next/dist/docs` is the pattern this repo already follows for Next, and the same
   applies to `node_modules/better-auth`. Do it before step 3.
3. Send the invite link from `inviteMemberAction`, and make "Resend invite" real in the same change;
   if the answer to Q2 is "email is not the flow", delete both affordances instead — a promise the
   server cannot keep is worse than a button that does not exist.
4. Then `email_verified`: either verify it, or drop the pretence and stop reading it.

## Later increments

- Password reset, which depends on 3. This also unblocks `settings/account` in spec 07.
- Sign-up rate limiting, once there is a transport an attacker can make the app hammer.

## Deferred / open questions

- Q2/Q4 are the only blockers. If the owner wants the invite to be "share this URL yourself", then
  steps 1-3 shrink to deleting two strings and this spec closes.
- Deliverability of the demo workspace's seeded addresses (`*.jkboard.app`, `src/lib/demo.ts:15`) —
  undecided, and irrelevant if the domain is not ours to send to.

## Security / permissions

Sending mail is a write to the outside world: rate limit it, never include a password or a session
token in a message, and treat the invite link as a capability — the recipient proving they control
the address is exactly what `email_verified` is for.

## Verification

- Unit: the send call is present in the action, asserted structurally the way
  `tests/platform/unit/action-revalidation.unit.test.ts` asserts `revalidatePath`.
- Behavioural: spec 03's tier, with the transport mocked at the boundary — no test may hit a real
  provider.
- Live: invite an address the owner controls and confirm the link signs in. Unverified until someone
  reads the mail: whether the link works when the email client rewrites it.
