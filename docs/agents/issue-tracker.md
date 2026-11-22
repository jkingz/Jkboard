# Issue tracker: GitHub Issues

Tickets are GitHub issues on `jkingz/Jkboard`, read and written with the `gh` CLI.

## Conventions

- The spec is `./design_draft.md` (written by `/egm-draft`).
- One issue per ticket. The body has **What to build**, a **Blocked by:** line (`#NN, #NN` or `None`) and a checklist of acceptance criteria.
- Triage state is a label, exactly one per open issue (see `triage-labels.md`).
- Conversation and evidence go in issue comments (`gh issue comment NN`).
- Tickets 01–03 (Node 26 runtime pin) were local markdown files that closed before the move. They are in git history under `issues/`, deleted on 2026-11-23.

## Ticking and closing tickets

At the start of every session, and after every PR merges, reconcile open issues against `main` before
picking the next ticket:

1. For each open issue, tick every criterion that merged work or a run you can cite proves (CI run,
   command output, deploy log). Edit the body with `gh issue edit NN --body-file`. Unproven boxes stay unticked.
2. Comment the evidence: date, PR number, and the command or log line.
3. When every box is ticked, close it with `gh issue close NN`. A PR body with `Closes #NN` does this on merge.
4. An issue whose `Blocked by:` issues are all closed is unblocked. Name the next one to pick.

## When a skill says "publish to the issue tracker"

`gh issue create --title "…" --label <triage-label> --body-file <file>`

## When a skill says "fetch the relevant ticket"

`gh issue view NN --comments`. The user will normally pass the issue number directly.

## Wayfinding operations

Used by `/wayfinder`. The **map** is one issue with one **child** issue per ticket.

- **Map**: an issue titled `Map: <topic>`, labelled `map`, holding the Notes / Decisions-so-far / Fog body.
- **Child ticket**: an issue with the question in the body, a `Type:` line (`research`/`prototype`/`grilling`/`task`), and a `Map: #NN` line pointing at the map.
- **Blocking**: a `Blocked by: #NN, #NN` line in the body. An issue is unblocked when every issue it lists is closed.
- **Frontier**: open, unblocked, unassigned issues; lowest number wins.
- **Claim**: assign yourself (`gh issue edit NN --add-assignee @me`) before any work.
- **Resolve**: comment the answer under an `## Answer` heading, close the issue, then add a context pointer (gist + link) to the map's Decisions-so-far.
