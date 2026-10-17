# Pipeline: Plan → Design → Tickets → Build → Verify → Review

This document defines the end-to-end workflow for working on features, fixes, and improvements in this project.

## The Pipeline Stages

### 1. PLAN
**Purpose:** Clarify scope, identify dependencies, and get alignment before starting work.

**Activities:**
- Read governing docs (`AGENTS.md`, relevant `docs/*.md` files)
- Identify which spec(s) this work touches
- Check blocking questions from `product-overview.md` or `specs/README.md`
- Write a one-sentence scope statement
- Confirm understanding with stakeholders if needed

**Output:** Clear scope boundary, known blockers, success criteria

---

### 2. DESIGN
**Purpose:** Define approach, components, and integration points before coding.

**Activities:**
- Review existing architecture (`docs/architecture.md`)
- Map out component changes (if UI)
- Identify server action / query changes (if data layer)
- Consider security implications (membership checks, role checks)
- Draft API contracts if new endpoints/actions

**Output:** Design decisions documented, linked to relevant specs

---

### 3. TICKETS
**Purpose:** Create or update tracking items with acceptance criteria.

**Activities:**
- Open/update issue with clear title and context
- Link to relevant spec file
- Add Given/When/Then acceptance criteria
- Define verification steps
- Set appropriate labels and milestones

**Output:** Tracking item with verifiable acceptance criteria

---

### 4. BUILD (Code + Test)
**Purpose:** Implement feature while maintaining quality gates.

**Sequence per unit of work:**
1. **Test-first approach** - write failing test first (TDD where applicable)
2. **Implement smallest increment** - one feature at a time
3. **Verify immediately** - run tests, typecheck, lint
4. **Commit small** - meaningful commits, atomic changes
5. **Update docs** - ensure code and docs stay in sync

**Verification order:**
- TypeScript compilation (`pnpm typecheck`)
- ESLint pass (`pnpm lint`)
- Unit tests (`pnpm test:unit`)
- Integration tests (`pnpm test:integration` if applicable)
- Build succeeds (`pnpm build`)

**Output:** Green CI locally, all tests passing

---

### 5. VERIFY
**Purpose:** Prove the implementation meets requirements.

**Checklist:**
- [ ] Type checking passes
- [ ] Linting passes  
- [ ] All unit tests pass
- [ ] Integration tests cover write paths
- [ ] E2E flows work as expected
- [ ] Build completes successfully
- [ ] Code and docs are in sync
- [ ] No dead code or unused exports
- [ ] Security controls validated (membership checks, permissions)

**Command evidence required:** Every "verified" claim must name the command run and output observed.

**Output:** Verified green status with evidence

---

### 6. REVIEW
**Purpose:** External validation before merging.

**Process:**
1. Create PR with clear description linking to spec
2. Ensure CI pipeline is green
3. Request review based on changed modules
4. Address feedback iteratively
5. On approval: merge to main branch
6. Close associated tickets

**PR Requirements:**
- Linked spec number in description
- Summary of changes and rationale
- Evidence of local verification
- One-sentence scope reminder
- **Done / Next** recap at close

**Reviewers check:**
- Scope matches PR content (no drive-by changes)
- Tests verify actual behavior
- Docs updated to reflect current state
- No secrets exposed
- Git commit follows conventions

**Output:** Merged PR, closed tickets, deployment-ready

---

## Guardrails

**During any stage:**
- Don't implement what isn't specified in docs
- If ambiguous, resolve in relevant section first
- Missing info? Record as open question in spec, stop that branch
- Dead code? Remove it with grep proof
- Unknown thresholds? Label assumption, don't invent

**Before moving to next unit:**
1. Unit works end-to-end inside stated scope
2. No invariant violated
3. Spec reflects actual state
4. Full gate chain is green

---

## Automation Links

- **CI Pipeline:** `.github/workflows/ci.yml` runs gates on push/PR
- **Specs:** `specs/` directory - numbered by dependency order
- **Architecture:** `docs/architecture.md` - system design
- **Verification Gates:** `/verification-gates` skill - exact test chain
- **Git Workflow:** `/git-workflow` skill - commit, push, PR procedure
- **Development Workflow:** `/development-workflow` skill - work loop

---

## Example Flow

**Feature: Add password reset email**

1. **PLAN:** Read `spec 08`, identify Q4 blocker (email provider choice), clarify scope to just action layer first
2. **DESIGN:** Map server action flow (`resetPasswordAction`), identify query needs, define email contract
3. **TICKETS:** Create task with GWT: "Given user clicks reset, When token sent, Then email arrives with valid link"
4. **BUILD:** 
   - Write unit test for action validation
   - Implement action with membership check
   - Integrate email sending (or mock it)
   - Update `target-state.md` entry as complete
5. **VERIFY:** Run full test suite, confirm typecheck/lint/build green
6. **REVIEW:** PR with link to spec 08, show test outputs, address review comments

---

**Last reviewed:** 2026-10-17
