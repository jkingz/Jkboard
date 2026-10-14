# Verification Standards

> **A sentence earns its place only if its author read the thing this session.**
> Column names come from the migration, tokens from the stylesheet, routes from the filesystem,
> behavior from the handler. Otherwise it is a guess wearing a doc's clothes.

Every row below either cost real debugging time in this repo, or is a claim that shipped somewhere and
is easy to believe here. Each is a claim that went out, and the check that kills it. No count is
quoted: the table grows, and a number typed here is wrong the day the next row lands.

---

## Bad line / why it is wrong / good line

| Bad line (once believed) | Why it is wrong | Good line |
| --- | --- | --- |
| "Metrics are stored in typed columns (`impressions`, `clicks`…)." | The migration has one JSONB array. Every consumer written against that claim failed at runtime. | "Metric values are **not** typed columns. Each sync run writes a JSONB array to `metrics_snapshots.metrics`… only `keyword_rankings` is typed." |
| "`users`: id, email, role, client_id." | No `email` column — it lives in the auth schema. Handlers reached for a field that never existed. | "`users`: id uuid PK → `auth.users` on delete cascade, role, client_id FK, created_at. **No email column** — email lives in `auth.users`." |
| "Reference tokens as `bg-base`, `text-copy-primary`, `text-brand`." | Those utilities generate no CSS — they fail silently, so the page renders with the browser default and nobody notices. | List only utilities verified in the stylesheet: `bg-surface`, `text-text-primary`, `text-state-success`. |
| "Raw `<img>` is banned — the lint rule enforces it." | The rule ships as a **warning**, not an error. Calling a warning a gate makes the next agent believe a machine is checking something nothing is. | Name the severity you measured: "Review rule, not a gate — `pnpm lint` exits 0 with it." |
| Handler skeleton showing `json()`, `unauthorized()`, `readDashboard()`. | Invented helpers. A plausible example is the most convincing kind of wrong. | Paste the real handler's first 10 lines, or link it by `file:line`. |
| "Order: 401 → 400 → 403." | Read the code: it is 400 → 401 → 403 → 429 → 503. Documenting wrong precedence means the next agent preserves the wrong thing. | State precedence in the order the code checks it, and cite the file. |
| "`sync_logs` has no writer." | Half true, and half-true is the same damage. `writeSyncLog()` exists with zero route callers, and the seed script writes rows. | "`sync_logs`: writers are `writeSyncLog()` (zero non-test callers) and `scripts/seed.mjs`; no live sync path populates it." |
| Agents table listing `syncAgent`, `transformAgent`, `cacheAgent`, `insightsAgent`. | Four modules that do not exist. | List only what `ls` shows; aspirational modules go in [target-state.md](./target-state.md). |
| "`is_stale` banner not rendered." | The banner *is* rendered — it is unreachable, because nothing writes the flag. | "`is_stale` is a stored column the UI only reads; `markMetricsStale()` exists but nothing calls it." |
| "Integration tests skip without credentials, and the runner warns when they do." | True of the files, useless about the tier. While the tier is empty there is nothing to skip and no worker spawns, so the warning cannot fire. A green tier that collected nothing is indistinguishable from coverage. | Quote what the run collected: "integration tier is empty; `test:integration` exits 0 having run nothing." Prove any announcement works by adding one file and reading stderr — not by asserting it. |
| "`.agents/skills/` holds hardlinked copies — `ls -i` shows the inodes match." | Matching inodes prove shared content, which a **symlink** also produces. The real failure mode is a plain copy: `cp -R` and `cp -a` both turn a hardlink into an independent file that drifts while still looking paired. | Run `find <mirror> - type l` *and* `ls -i` in the project you are describing, name the mechanism you found, never write the sentence from the other project's memory. |
| "60 tests passing." | A count rots the day someone adds a test. | Run the command, quote its output in the reply, put nothing in the doc. |
| "Build passes locally and in CI." | The build downloaded a font from a third party; CI had no route to it. A warm cache hid this for weeks. | Prefer builds that need no network. Prove it: cold build with egress blackholed — `rm -rf .next && NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:9 <build cmd>`. |

### Rows from this repo

| Bad line | Why it is wrong | Good line |
| --- | --- | --- |
| "`member`: id, name, email, role." | There is no `name` or `email` column. Both live in `user`. | "`member`: id uuid PK, user_id → `user.id` cascade, role text, status enum, joined_at, last_active_at. **No name/email column** — identity lives in `user`." |
| "Deleting a member removes their tasks." | `assignee_id` is `ON DELETE SET NULL`. Tasks survive, unassigned. | "Deleting a member nulls `task.assignee_id` and leaves the task in place; their owned projects are transferred first because `owner_id` is `ON DELETE RESTRICT`." |
| "Tests pass." | Only true of the tier that ran. The integration tier skips without a real `DATABASE_URL` and still exits 0. | "`pnpm test` → 25 passed, 1 skipped (26). Unit tier ran; integration skipped — `DATABASE_URL` is still the placeholder, so persistence invariants are unverified." |
| "The suite is green, so the feature works." | The whole suite is 17 unit tests over pure functions and 8 read-only schema assertions. Nothing has ever exercised a server action end to end. | "Unit + schema assertions pass. No test has written a row; the actions remain unverified behaviourally." |
| "`src/proxy.ts` guards the dashboard." | It only checks cookie presence. A stale cookie passes it. | "`src/proxy.ts` is an optimistic cookie-presence check; real verification is `auth.api.getSession()` in `(dashboard)/layout.tsx:25`." |
| "shadcn/ui with Radix primitives." | This project is on Base UI. | "shadcn `base-nova` on `@base-ui/react`; props are Base UI's, not Radix's." |
| "Use `cn()` from clsx + tailwind-merge." | Neither package is installed; `cn` is a single dependency. | "`cn()` is re-exported from the `cn` package in `src/lib/utils.ts`." |
| "Route protection is handled by middleware." | Renamed in Next 16. | "`src/proxy.ts` exports `proxy`; `middleware.ts` is the deprecated filename." |
| "The build is hermetic." | Inter is fetched from Google at build time. | "Inter comes from `next/font/google`; verify cold — `rm -rf .next && NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:9 pnpm build` exits 1." |
| "`description` is written but never read." | True of `task.description`, false of `project.description`, which three components render. | "`task.description` has no reader — `taskSchema` omits the field. `project.description` **is** rendered (`projects-grid.tsx:275`, `project-board.tsx:127`)." |
| "The seed arrays in `src/data/jkboard.ts` are only test fixtures." | `src/components/command-search.tsx:30` imports the seed `projects` array and `site-header.tsx:73` renders it, so the ⌘K palette ships sample data. | "The seed arrays are live defaults, and `command-search.tsx` reads one of them — the ⌘K palette lists hardcoded projects, not the workspace." |
| "The build needs real credentials." | It needs the env vars **present**, not valid. Placeholders from `.env.example` build fine. | "`pnpm build` exits 0 against the placeholder `DATABASE_URL` because `(dashboard)` is `force-dynamic`; deleting `.env.local` fails at page-data collection." |
| "`from user` is fine in raw SQL." | `user` is a Postgres reserved word. Unquoted, the query fails with `column u.id does not exist`, which reads like a missing column rather than a syntax problem. | Quote it: `from \"user\"`. Drizzle does this automatically; hand-written SQL will not. |
| "The demo account is safe because the password is obscure." | It is printed on a public landing page. | "`DEMO_PASSWORD` is public by design — a label, not a secret. The demo is protected only by nobody deleting things; no action checks a role." |
| "The demo login is broken." | It works: `POST /api/auth/sign-in/email` returns 200 with a session cookie. | "Demo sign-in works. Verify in a **production** build — `next dev` recompiled 2,739 times while testing and never settled hydration, which looks identical to a broken form." |
| "The nav Demo link is dead." | It works. `Button render={<Link/>}` emits `<a role="button">`, so `getByRole('link')` cannot match it. Playwright times out on a link that navigates fine. | "Query `a[href=\"/sign-in\"]` rather than the link role. Confirm the `href` from the DOM before concluding a link is broken." |
| "The landing page has a test gate." | No test covers any UI. `pnpm test` runs pure selectors and read-only schema assertions. | "Typecheck, lint and build pass; the UI was verified by clicking it in a browser, not by a test." |

---

## Standing rules for these docs

- **Absence claims need a grep.** "Nothing calls X" is a claim about the whole repo. Run the search
  across every source root and say what you searched.
- **Split by truth, not by topic.** A doc describes *implemented* behavior or *target* behavior —
  never both in one breath.
- **When code and doc disagree, the doc is the defect**, and you fix it in the same change.
- **Mark what you did not verify.** `unverified:` in front of a line is honest. Silence about it is
  how the next agent gets misled.
- **Update as you build, not at the end.**
- **Do not invent thresholds, policies or precedents.** Point at the artifact, or drop the claim.

---

## Health check

Every `<ANGLE_BRACKET>` outside this file is an unfilled slot:

```bash
grep -rn '<[a-zA-Z_/]' docs/ AGENTS.md | grep -v verification-standards
```

Zero hits means these docs describe this project and only this project.