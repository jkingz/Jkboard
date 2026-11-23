# Jkboard

Project and task tracking for a single team: projects broken into tasks, each with an owner, an
assignee and a due date.

## Language

### The team

**Workspace**:
The one shared space that holds every Project and every Member. There is exactly one.
_Avoid_: Organization, tenant, team space

**Single-trust team**:
The Workspace's trust model: every Member may do everything, with no permissions between them.

**Member**:
A person who belongs to the Workspace. Projects are owned by Members and Tasks are assigned to Members.
_Avoid_: User, account, teammate

**Job title**:
A Member's descriptive title, such as "Product Lead". It grants no permissions.
_Avoid_: Role

**Invited**:
A Member who has been added but has not yet signed in. An Invited Member can be on a Project team and be an Assignee, but cannot be an Owner or Away.

**Active**:
A Member who has signed in at least once.

**Away**:
An Active Member who is temporarily unavailable. Being Away changes nothing they may do or hold.
_Avoid_: Inactive, offline

**Removed**:
A former Member who has left the Workspace for good. Their Tasks become unassigned and their Projects pass to the Member who removed them.
_Avoid_: Deleted, deactivated

### The work

**Project**:
A body of work with a status, an Owner, a Project team and a due date, broken into Tasks. Its status is the team's judgment, independent of its Tasks' statuses.

**Project team**:
The Members on a Project. A Member "on the Project" is part of its Project team. A Member who leaves a Project team is no longer the Assignee of its Tasks; those Tasks become unassigned.
_Avoid_: Project member

**Owner**:
The one Member accountable for a Project. The Owner is always on the Project team and is never Invited.

**Key**:
A Project's short uppercase code, such as "MOB". It is unrelated to Task References.
_Avoid_: Prefix, code

**Task**:
A single unit of work that belongs to one Project for its whole life, with a status, a priority, a due date and at most one Assignee. Its due date may fall after the Project's.
_Avoid_: Issue, ticket, card

**Assignee**:
The Member responsible for a Task. The Assignee must be on the Task's Project team.
_Avoid_: Owner (that word belongs to Projects)

**Completed**:
A Task that is finished, dated from the moment it first became Completed. Reopening it clears that date.
_Avoid_: Done, closed

**Reference**:
A Task's permanent label, unique across the Workspace, such as "TSK-0042".
_Avoid_: Task ID, task number

**Due date**:
The date by which a Project or Task should be finished.
_Avoid_: Deadline
