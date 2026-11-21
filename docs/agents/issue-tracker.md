# Issue tracker: Local Markdown

The spec and its tickets live as markdown files in the repo root.

## Conventions

- The spec is `./design_draft.md` (written by `/egm-draft`)
- Implementation issues are one file per ticket at `issues/<NN>-<slug>.md`, numbered from `01`, never a single combined tickets file
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## Ticking and closing tickets

At the start of every session, and after every PR merges, reconcile `issues/` against `main` before
picking the next ticket:

1. For each open ticket, tick every criterion that merged work or a run you can cite proves (CI run,
   command output, deploy log). Unproven boxes stay unticked.
2. Append the evidence under `## Comments`: date, PR number, and the command or log line.
3. When every box is ticked, set `Status: resolved`.
4. A ticket whose `Blocked by:` tickets are all `resolved` is unblocked; name the next one to pick.

The ticket edits travel in the next PR; never commit them straight to `main`.

## When a skill says "publish to the issue tracker"

Create a new file under `issues/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a file with one **child** file per ticket.

- **Map**: `issues/map.md` (the Notes / Decisions-so-far / Fog body).
- **Child ticket**: `issues/NN-<slug>.md`, numbered from `01`, with the question in the body. A `Type:` line records the ticket type (`research`/`prototype`/`grilling`/`task`); a `Status:` line records `claimed`/`resolved`.
- **Blocking**: a `Blocked by: NN, NN` line near the top. A ticket is unblocked when every file it lists is `resolved`.
- **Frontier**: scan `issues/` for files that are open, unblocked, and unclaimed; first by number wins.
- **Claim**: set `Status: claimed` and save before any work.
- **Resolve**: append the answer under an `## Answer` heading, set `Status: resolved`, then append a context pointer (gist + link) to the map's Decisions-so-far in `issues/map.md`.
