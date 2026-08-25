# Development

## Prerequisites

- Node.js 20+ (developed against Node 24)
- Docker (for the local PostGIS-enabled Postgres)

## First-time setup

```bash
npm install
cp .env.example .env    # already done if you're in this repo's dev container — see note below
docker compose up -d    # starts Postgres 16 + PostGIS on localhost:5432
npx prisma migrate dev  # applies migrations, generates the Prisma client
npm run db:seed         # loads the demo/seed dataset (safe to re-run)
npm run dev
```

App runs at `http://localhost:3000`.

> The committed `.env` in this repo points at the docker-compose credentials
> (`traveldiary`/`traveldiary`) and is fine for local dev as-is — it holds no
> real secrets. Never point `AUTH_SECRET`/OAuth credentials/production
> `DATABASE_URL` at this file; use real environment variables in any shared
> or deployed environment instead.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | `prisma migrate dev` — create/apply a migration |
| `npm run db:seed` | Re-run the demo seed (idempotent) |
| `npm run db:studio` | Open Prisma Studio to browse the database |

## Database

Local Postgres+PostGIS runs via `docker-compose.yml`:

```bash
docker compose up -d     # start
docker compose down      # stop (keeps the volume/data)
docker compose down -v   # stop and wipe all data
```

Schema changes go through Prisma migrations
(`prisma/schema.prisma` → `npm run db:migrate`). The one hand-written raw-SQL
migration (`search_and_geo_indexes`) adds trigram and GIST indexes Prisma
can't express natively — see [`database.md`](./database.md#indexes).

**Never run `prisma migrate reset` or any other schema-dropping command
against anything but a local/throwaway database** — it destroys all data in
the target database.

## Environment variables

See [`.env.example`](../.env.example) for the full list with comments.
Nothing is required to `npm run dev` beyond `DATABASE_URL` and `AUTH_SECRET`
(both already set in the committed local `.env`) — Google OAuth, email
sending, media storage, and analytics all degrade gracefully (or fail
loudly with a clear error, in media storage's case) when unconfigured,
rather than silently breaking the rest of the app.

## Auth in local dev

- **Google sign-in** requires `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`
  (from the Google Cloud Console) in `.env`.
- **Email sign-in** requires `EMAIL_SERVER_*`/`EMAIL_FROM` (any SMTP
  sender — Mailtrap/Resend/etc. work fine for local dev) in `.env`.
- Without either configured, sign-in will error when clicked — browsing,
  saving, and guest trip planning all still work with no account.

## Project structure

See [`architecture.md`](./architecture.md) for the module layout and the
reasoning behind it.

## Adding a new content field

1. Add the field to `prisma/schema.prisma`.
2. `npm run db:migrate` — name the migration descriptively.
3. Update the relevant `select`/`include` in `src/features/*/service.ts` if
   the field should be exposed publicly (verification/internal fields
   deliberately are not — see `database.md`).
4. Update `prisma/seed.ts` if seed data should exercise the new field.
