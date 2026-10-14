-- Adds a short human-facing task reference (TSK-0001) alongside the UUID primary key.
-- The UUID stays the real key used by foreign keys and routes; this only exists
-- so the UI never has to render a 36-character UUID to a person.

CREATE SEQUENCE IF NOT EXISTS "task_reference_seq" START WITH 1;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "reference" text;--> statement-breakpoint

-- Backfill existing rows in a stable order so references follow creation order.
UPDATE "task" AS t
SET "reference" = 'TSK-' || lpad(nextval('task_reference_seq')::text, 4, '0')
FROM (
  SELECT id, row_number() OVER (ORDER BY created_at ASC, id ASC) AS n
  FROM "task"
) AS ranked
WHERE t.id = ranked.id;--> statement-breakpoint

-- Keep the sequence ahead of anything inserted while the backfill ran.
SELECT setval(
  'task_reference_seq',
  GREATEST((SELECT COALESCE(MAX(n), 1) FROM (
    SELECT row_number() OVER (ORDER BY created_at ASC, id ASC) AS n FROM "task"
  ) ranked), 1)
);--> statement-breakpoint

ALTER TABLE "task" ALTER COLUMN "reference" SET DEFAULT ('TSK-' || lpad(nextval('task_reference_seq')::text, 4, '0'));--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "reference" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "task_reference_uidx" ON "task" USING btree ("reference");