/**
 * One-off cleanup for issue #15: unassigns every Task whose Assignee is not on
 * its Project team (GLOSSARY.md → Assignee), then prints how many rows changed.
 *
 *   node --env-file=.env.local node_modules/tsx/dist/cli.mjs scripts/unassign-off-team.ts
 *
 * Safe to re-run: a second run changes nothing.
 * shortcut: one-off script, delete it once it has run against every database.
 */
import { neon } from "@neondatabase/serverless"

async function main() {
  const url = process.env.DATABASE_URL

  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.")
  }

  const sql = neon(url)
  const rows = await sql`
    update task set assignee_id = null
    where assignee_id is not null
      and not exists (
        select 1 from project_member pm
        where pm.project_id = task.project_id and pm.member_id = task.assignee_id
      )
    returning id`

  console.log(`Unassigned ${rows.length} Task(s) whose Assignee was off the Project team.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
