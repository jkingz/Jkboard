# The integration tier stays local-only

CI runs `pnpm test:unit` and `pnpm test:interface`, never `pnpm test`, and carries no real `DATABASE_URL`. The integration tier, which needs a live Neon database, runs only on a maintainer's machine. We chose this over storing a Neon branch URL as a repository secret because a secret-dependent job fails on forks and first clones for a reason that is not a defect. Decided 2026-11-24.

## Consequences

- A green CI check proves the unit and interface tiers, not the schema or the persistence invariants.
- If the integration tier ever runs in CI, this ADR gets superseded.
