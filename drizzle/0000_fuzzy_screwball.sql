CREATE TYPE "public"."jkboard_member_status" AS ENUM('active', 'invited', 'away');--> statement-breakpoint
CREATE TYPE "public"."jkboard_project_status" AS ENUM('planning', 'active', 'on-hold', 'completed');--> statement-breakpoint
CREATE TYPE "public"."jkboard_task_priority" AS ENUM('urgent', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."jkboard_task_status" AS ENUM('todo', 'in-progress', 'in-review', 'completed');--> statement-breakpoint
CREATE TABLE "jkboard_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jkboard_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "jkboard_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "jkboard_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jkboard_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "jkboard_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jkboard_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'Member' NOT NULL,
	"status" "jkboard_member_status" DEFAULT 'invited' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "jkboard_project_member" (
	"project_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	CONSTRAINT "jkboard_project_member_project_id_member_id_pk" PRIMARY KEY("project_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "jkboard_project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" "jkboard_project_status" DEFAULT 'planning' NOT NULL,
	"color" text DEFAULT 'var(--chart-1)' NOT NULL,
	"owner_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"due_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jkboard_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text DEFAULT 'TSK-' || lpad(nextval('jkboard_task_reference_seq')::text, 4, '0') NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" "jkboard_task_status" DEFAULT 'todo' NOT NULL,
	"priority" "jkboard_task_priority" DEFAULT 'medium' NOT NULL,
	"assignee_id" uuid,
	"due_date" date NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jkboard_account" ADD CONSTRAINT "jkboard_account_user_id_jkboard_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."jkboard_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jkboard_session" ADD CONSTRAINT "jkboard_session_user_id_jkboard_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."jkboard_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jkboard_member" ADD CONSTRAINT "jkboard_member_user_id_jkboard_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."jkboard_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jkboard_project_member" ADD CONSTRAINT "jkboard_project_member_project_id_jkboard_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."jkboard_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jkboard_project_member" ADD CONSTRAINT "jkboard_project_member_member_id_jkboard_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."jkboard_member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jkboard_project" ADD CONSTRAINT "jkboard_project_owner_id_jkboard_member_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."jkboard_member"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jkboard_task" ADD CONSTRAINT "jkboard_task_project_id_jkboard_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."jkboard_project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jkboard_task" ADD CONSTRAINT "jkboard_task_assignee_id_jkboard_member_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."jkboard_member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "jkboard_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "jkboard_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "jkboard_verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "member_userId_uidx" ON "jkboard_member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "member_status_idx" ON "jkboard_member" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_member_memberId_idx" ON "jkboard_project_member" USING btree ("member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_key_uidx" ON "jkboard_project" USING btree ("key");--> statement-breakpoint
CREATE INDEX "project_status_idx" ON "jkboard_project" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_ownerId_idx" ON "jkboard_project" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "project_dueDate_idx" ON "jkboard_project" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "task_projectId_idx" ON "jkboard_task" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "task_status_idx" ON "jkboard_task" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_dueDate_idx" ON "jkboard_task" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "task_assigneeId_idx" ON "jkboard_task" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "task_projectId_status_idx" ON "jkboard_task" USING btree ("project_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "task_reference_uidx" ON "jkboard_task" USING btree ("reference");