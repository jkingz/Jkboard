# FlowBoard

A modern project & task management dashboard built with Next.js, TypeScript, Tailwind CSS v4 and shadcn/ui.

<!-- prettier-ignore -->
> Built on top of the open-source [shadcn Dashboard + Landing Page Template](https://github.com/shadcnstore/shadcn-dashboard-landing-template) by [ShadcnStore](https://shadcnstore.com), extended with authentication, a Postgres data layer and FlowBoard's project/task features.

## Features

- **Projects & Tasks** — create projects, break them into tasks, drag-and-drop task boards
- **Dashboard overview** — stats cards, activity charts, recent projects and tasks
- **Calendar** — deadlines and task scheduling
- **Team management** — invite members, role-based team table
- **Settings** — profile, account and notification preferences
- **Landing page** — marketing page built into the same app
- **Auth** — email/password sign in and sign up via [Better Auth](https://better-auth.com)

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui on Base UI |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Auth | Better Auth |
| Tables | TanStack Table |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Drag & drop | dnd-kit |

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the example file and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Pooled Postgres connection string (Neon console → Connection Details) |
| `BETTER_AUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Base URL the app runs on, e.g. `http://localhost:3000` |

### 3. Set up the database

```bash
pnpm db:push      # push the Drizzle schema to Postgres
pnpm db:seed      # optional: seed sample data
```

### 4. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run `tsc --noEmit` |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:push` | Push schema directly |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Seed sample data |
| `pnpm db:seed:auth` | Seed auth users |

## License

MIT
