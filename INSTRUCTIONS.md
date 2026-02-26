# Setup Instructions

## Prerequisites

- Node.js 20+
- npm

## First-time setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
```

Edit `.env.local` and set:
- `DATABASE_URL` — path to SQLite file (default `file:./dev.db` is fine for local dev)
- `SESSION_SECRET` — at least 32 random characters (e.g. `openssl rand -hex 32`)

```bash
# 3. Create the database and run migrations
npx prisma migrate dev

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Create the admin account

On first run, navigate to [http://localhost:3000/admin/setup](http://localhost:3000/admin/setup) to create your admin account.

After setup, log in at [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## Quality gates

```bash
npm run lint    # ESLint
npm run build   # Next.js production build
npm test        # Vitest unit tests
```

## File uploads

Vendor attachments are saved to the `/uploads` directory at the project root. This directory is gitignored. Back it up separately in production.

## Environment variables reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite connection string, e.g. `file:./dev.db` |
| `SESSION_SECRET` | Yes | Random string ≥ 32 chars for session cookie encryption |
| `NODE_ENV` | No | `development` or `production` |
