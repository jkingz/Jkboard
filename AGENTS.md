<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

The rules every change obeys. Read them before any taskable request.

The project's own knowledge — commands, schema, routes, conventions — lives in [`docs/`](./docs/README.md).
This file stays short so it stays read.

---

## Standing rules

**1. Be concise.** No preamble, no "here is what I did" essay. State the change, the result, and the one thing you need from me. Every unit of work — spec, feature, fix, PR — closes with the two-line **Done / Next** block in chat, unprompted; its shape is step 6 of [`/development-workflow`](./.claude/skills/development-workflow.md).

**2. No "done" without a command behind it.** Every claim of completion names the command run and what it printed. Untested by you = unverified: say "not verified", never "should work". Type-checking proves types, not behavior.

**3. Scope is the request, not the opportunity.** The blast radius of a change equals the radius of what was asked. No drive-by cleanup, renames, formatting, "while I'm here" extractions, or predicted abstractions. A nearby problem you spotted is one line in your reply, never in the diff.

**4. Delete unused, but prove it was unused.** Remove dead files, exports, imports, env vars, CSS, tokens, orphaned components. Grep for callers before deleting; state what you removed and how you checked. Known dead code is tracked in [`docs/target-state.md`](./docs/target-state.md), not here.

**5. End clean.** Kill or restart servers only during the current task. Clear stale processes on ports the app uses before starting your own. Leave no orphaned dev server, worker or background job.

**6. Secrets stay secret.** Reference a secret by name, never by value. `.env*` never enters git; committed files carry names and empty placeholders only. If a value reaches a client bundle or a public response, it is not a secret.

**7. Git actions need authorization.** Commit, push, open or merge a PR only when asked. Before pushing a working branch: pull from main, merge, resolve, then push. No `--no-verify`, no bypassed signing. Never force-push a shared branch, and never `reset --hard` / `clean -f` / `checkout --` over work you did not write.

**8. Every posted comment is a contract.** Watch a PR with `/babysitting-a-pr`, and anything posted to a PR or issue goes through `/leaving-pr-comment` — triggers, body contract, AI-authorship disclaimer. No filler comments; a declined finding gets a written decline and a resolved thread.

**9. Use the harness.** Check the skills before starting; if one applies, load it instead of re-deriving the workflow. Never hand-write a loop the platform already provides.

**10. Unknowns are labelled, not invented.** No fabricated thresholds, policies, precedents, APIs or file paths. State the assumption plus the step that would verify it. When the code and the docs disagree, the code is truth and the doc is the defect.

---

## Skills

`.claude/skills/` — load when the context applies.

| Skill | Use when |
| --- | --- |
| [`/development-workflow`](./.claude/skills/development-workflow.md) | scoping a task, or deciding what "done" means for a unit of work |
| [`/verification-gates`](./.claude/skills/verification-gates.md) | finishing implementation, or deciding what to run and how to report it |
| [`/testing`](./.claude/skills/testing.md) | writing, running or restructuring tests |
| [`/git-workflow`](./.claude/skills/git-workflow.md) | committing, pushing, or opening a PR; commit conventions live in [`docs/project-context.md`](./docs/project-context.md) |
| [`/babysitting-a-pr`](./.claude/skills/babysitting-a-pr/SKILL.md) | watching an open PR |
| [`/leaving-pr-comment`](./.claude/skills/leaving-pr-comment/SKILL.md) | before posting to a PR or issue |

## Docs and specs

Read the one file that governs the change; the map in [`docs/README.md`](./docs/README.md) says which
and when to fill it. Work is specified in [`specs/`](./specs/README.md) — one numbered file per unit,
ordered by what unblocks what.

**Pipeline workflow:** Plan → Design → Tickets → Build → Verify → Review (see [docs/pipeline.md](./docs/pipeline.md))

## Before starting

Load `/development-workflow` and work its loop. It is the same six steps in one place; this file does
not restate them.

## Health check

Every angle-bracketed slot in `docs/` outside `verification-standards.md` is one you still owe — and
this file contributes none, so zero hits is reachable:

```bash
grep -rn '<[a-zA-Z_/]' AGENTS.md docs/ | grep -v verification-standards
```

Zero hits means the docs describe this project and only this project.

---

## Pipeline commands

Verify full gate chain before creating PR:

```bash
pnpm pipeline:verify    # Run all gates (typecheck / lint / test / build)
pnpm pipeline:build     # Build gates only
pnpm pipeline:review    # Pre-flight review checks
./scripts/pipeline-verify.sh --all  # Full pipeline validation
```
