<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

The rules every change obeys. Project knowledge (commands, schema, routes, conventions) lives in
[`docs/`](./docs/README.md).

## Rules

1. **Be concise.** State the change, the result, and the one thing you need from me.
2. **No "done" without a command.** Name the command run and what it printed. Untested = "not verified".
3. **Scope is the request.** A nearby problem is one line in the reply, never in the diff.
4. **Delete unused, but prove it.** Grep callers first; say what you removed and how you checked.
5. **End clean.** No orphaned dev server or background job.
6. **Secrets stay secret.** Reference by name, never value. `.env*` never enters git.
7. **Git actions need my go-ahead.** Commit, push, PR or merge only when asked. No `--no-verify`, no force-push to a shared branch.
8. **Unknowns are labelled, not invented.** Code is truth; when a doc disagrees, fix the doc.

## Coding mode

Ponytail (full) is on for all coding: smallest complete change; known limits get a `shortcut:` comment.

## Workflow

| Stage | Skill |
| --- | --- |
| Stress-test an idea | `/grilling` or `/egm-brainstorm` |
| Spec | `/egm-draft` → `/egm-review`; the spec is `./design_draft.md` |
| Tickets | `/to-tickets` → `issues/NN-slug.md` |
| Triage | `/triage` |
| Build | `/implement`, or `/tdd` for risky logic |
| Bug | `/diagnosing-bugs` |
| Review | `/code-review` (vs spec), `/ponytail-review` (bloat, safety) |
| Domain terms and decisions | `/domain-modeling` → `GLOSSARY.md`, `docs/adr/` |
| PR body | `/pr` |
| After merge | Tick proven criteria, resolve tickets, name the next one (`docs/agents/issue-tracker.md`) |

## Checks

```bash
pnpm typecheck && pnpm lint && pnpm test:unit && pnpm build   # same chain as CI
```

## Agent skills

Where the mattpocock skills read and write. The workflow table above lists the skills.

### Issue tracker

Spec is `./design_draft.md`; tickets are local markdown in `issues/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) as `Status:` lines. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at the repo root, created lazily. See `docs/agents/domain.md`.
