# Jkboard is a single-trust team

Jkboard has exactly one Workspace, and every Member can do everything: create, edit and delete any Project or Task, invite Members, and remove them. There are no permissions. We chose this over role-based authorization because the product is for one small team that trusts each other, and the Job title a Member carries is descriptive only.

## Consequences

- The demo credentials are public, so any visitor signed in as a demo Member can empty the demo Workspace. The answer is to reseed it, not to add permissions.
- "Role" stays free for a future permission concept. If permissions are ever added, this ADR gets superseded. It is not something to patch around.
