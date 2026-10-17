# Pipeline Stage Checklists

Use these checklists to validate work at each pipeline stage.

## PLAN Stage Checklist

- [ ] Read `AGENTS.md` standing rules
- [ ] Identify relevant `docs/*.md` files for touched module
- [ ] Check blocking questions in `product-overview.md` or `specs/README.md`
- [ ] Write one-sentence scope statement: what changes, what does NOT
- [ ] Confirm understanding with stakeholders (if applicable)
- [ ] Link to relevant spec number(s)
- [ ] Document success criteria

**Output:** Scope boundary documented, known blockers identified

---

## DESIGN Stage Checklist

- [ ] Review `docs/architecture.md` invariants
- [ ] Map component changes (if UI work)
- [ ] Map server action/query changes (if data layer)
- [ ] Consider security implications:
  - [ ] Membership checks required?
  - [ ] Role authorization needed?
  - [ ] Session identity requirements?
- [ ] Draft API contracts if new endpoints/actions
- [ ] Identify breaking changes (if any)
- [ ] Document decisions with rationale

**Output:** Design decisions documented, architecture aligned

---

## TICKETS Stage Checklist

- [ ] Create/update issue with clear title
- [ ] Link to relevant spec file(s)
- [ ] Add Given/When/Then acceptance criteria:
  - [ ] GWT scenario 1
  - [ ] GWT scenario 2 (edge cases)
  - [ ] GWT error scenarios
- [ ] Define verification steps
- [ ] Set labels (spec#, feature, bug, etc.)
- [ ] Set milestones/sprint
- [ ] Assign owner

**Output:** Tracking item with verifiable acceptance criteria

---

## BUILD Stage Checklist

**Test-First:**
- [ ] Write failing test before implementation
- [ ] Test covers happy path
- [ ] Test covers error paths

**Implementation:**
- [ ] Implement smallest increment possible
- [ ] One logical change per commit
- [ ] Commit message follows conventions (`feat:`, `fix:`, etc.)
- [ ] Why documented in commit body

**Immediate Verification:**
- [ ] Typecheck passes (`pnpm typecheck`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Unit tests pass (`pnpm test:unit`)
- [ ] Integration tests pass (`pnpm test:integration` if applicable)
- [ ] Build succeeds (`pnpm build`)

**Code Quality:**
- [ ] No dead code or unused exports
- [ ] No secrets committed
- [ ] No "while I'm here" extraneous changes
- [ ] Security controls in place

**Output:** Green CI locally, all tests passing

---

## VERIFY Stage Checklist

**Full Gate Chain:**
- [ ] TypeScript compilation - run: `pnpm typecheck`
- [ ] ESLint pass - run: `pnpm lint`
- [ ] All unit tests - run: `pnpm test:unit`
- [ ] Integration tests - run: `pnpm test:integration` (if available)
- [ ] E2E flows work as expected - manual or automated
- [ ] Build completes - run: `pnpm build`
- [ ] Code and docs in sync
- [ ] Dead code checked with grep
- [ ] Security controls validated

**Requirements Validation:**
- [ ] Implementation matches spec exactly
- [ ] Ambiguous requirements resolved in docs first
- [ ] Missing info documented as open question
- [ ] Invariants from `architecture.md` not violated

**Evidence Required:**
- [ ] Every claim named command run
- [ ] Command output captured or reproducible
- [ ] Not just "should work" but tested

**Output:** Verified green status with command evidence

---

## REVIEW Stage Checklist

**PR Preparation:**
- [ ] PR title format: `<type>(<scope>): <imperative summary>`
- [ ] PR description includes:
  - [ ] What changed (2-3 bullets)
  - [ ] How verified (each gate + live check)
  - [ ] What wasn't covered (credentials, third-party, etc.)
  - [ ] Linked spec number
  - [ ] One-sentence scope reminder
- [ ] CI pipeline is green
- [ ] Branch up-to-date with main (merged conflicts)
- [ ] Ready for review label set

**Review Process:**
- [ ] Request reviewers based on changed modules
- [ ] Address feedback iteratively
- [ ] Re-run verification after changes
- [ ] Ensure no drift from original scope

**Post-Approval:**
- [ ] Final merge to main
- [ ] Close associated tickets
- [ ] Deploy if ready
- [ ] **Done / Next** recap in chat

**Output:** Merged PR, closed tickets, deployment-ready

---

## Quick Reference Commands

```bash
# Run full pipeline verification
./scripts/pipeline-verify.sh verify

# Run individual stages
./scripts/pipeline-verify.sh plan
./scripts/pipeline-verify.sh design  
./scripts/pipeline-verify.sh build
./scripts/pipeline-verify.sh review

# Or manually run gates
pnpm typecheck   # TypeScript
pnpm lint        # ESLint
pnpm test:unit   # Unit tests
pnpm build       # Production build
```

---

**Last updated:** 2026-10-17
