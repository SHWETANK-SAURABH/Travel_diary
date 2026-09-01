# Production

Deployment, environment, migration, backup/recovery, and rollback
guidance for taking this app to a real, publicly-reachable environment.
Phase 12 hardens the app *for* production; actually standing up hosting,
a domain, and live monitoring is Phase 14's job (`docs/phase.md`) — this
document is the runbook that phase (or whoever deploys first) follows, not
a record of an existing live deployment. Nothing described as "configured"
below is running anywhere yet outside local dev.

## Recommended platform

Vercel (the framework's native platform — `.vercel` is already gitignored
in anticipation) for the Next.js app; a managed Postgres with PostGIS
support for the database, since the schema depends on the `geography`
column type (`prisma/schema.prisma`, see
[`database.md`](./database.md#geospatial-columns)) — Neon, Supabase, or
Railway all support this; a bare RDS Postgres instance does not have
PostGIS enabled by default and needs the extension installed explicitly.
Nothing in the codebase is Vercel-specific (no `@vercel/*` imports, no
platform-specific APIs) — any Node.js host that can run `next build && next
start` works, this is a recommendation, not a hard dependency.

## Environment variables

Full list with comments: [`.env.example`](../.env.example). Required for
the app to function at all in production:

| Variable | Required for |
|---|---|
| `DATABASE_URL` | Everything — the app cannot start without a database |
| `AUTH_SECRET` | Session security — generate with `npx auth secret`, never reuse the local dev value |
| `AUTH_URL` | Correct OAuth callback URLs — must match the real production domain exactly |

Everything else (`GOOGLE_CLIENT_*`, `EMAIL_SERVER_*`, `MEDIA_STORAGE_*`,
`ANALYTICS_*`) degrades gracefully when unset — see `docs/development.md`'s
"Auth in local dev" — **except** `MEDIA_STORAGE_*` (`getUploadUrl` in
`src/lib/media/storage.ts` throws loudly rather than silently accepting
broken uploads). `MAP_PROVIDER_KEY` is declared in `.env.example` and the
env schema (`src/config/env.ts`) but not actually read anywhere —
`MapCanvas.tsx` points at a free, keyless vector basemap
(`tiles.openfreemap.org`) instead, confirmed by grepping for the variable's
name across `src/`. Leave it blank; it's a placeholder for a future paid
provider, not a currently-required setting.

**Never commit real values for any of these.** The `.env` checked into
this repo is local-dev-only (docker-compose credentials, no real secrets)
— see the warning in `docs/development.md`.

## Database migrations in production

`npx prisma migrate deploy` — never `migrate dev` (which can prompt
interactively and offers to reset the database) and never `db push`
(bypasses the migration history entirely). This environment's own
constraint (`migrate dev` requiring interactive confirmation) is why every
schema change in this project so far was written as a hand-authored
migration and applied with `migrate deploy` — see `docs/database.md` for
the pattern. The same discipline carries to real production: apply
migrations as a deploy step, before the new application code that depends
on them starts serving traffic, never after.

**Before running a migration against production data**, read it. A
`CREATE INDEX` or additive column is always safe; a column drop, rename,
or `NOT NULL` addition on an existing populated table is not — check
`prisma/migrations/*/migration.sql` by hand for anything destructive
before deploying, the same way this project's own migrations were
hand-reviewed rather than blindly trusted throughout Phases 1–12.

## Backup & recovery

**Not automated by this codebase** — this is infrastructure the hosting
provider owns, not application code. Whichever managed Postgres provider
is chosen (see "Recommended platform") should have point-in-time recovery
enabled before real user data exists in it; verify this is actually
turned on (not just available on the plan) as part of Phase 14's setup,
not assumed. Minimum bar before launch: automated daily backups with at
least 7 days of retention, and one documented test restore performed
before go-live — an untested backup is not a backup.

## Rollback

Two independent rollback paths, since a bad deploy and a bad migration are
different failure modes:

- **Application code**: redeploy the previous known-good build/commit.
  Stateless — no data implications, safe at any time.
- **Database migrations**: Prisma does not auto-generate a `down`
  migration. Reverting a schema change means hand-authoring the inverse
  SQL (drop what was added, restore what was dropped from a backup) —
  which is exactly why "read every migration before applying it" (above)
  matters more than a rollback plan does. Prefer additive, backward-
  compatible migrations (new nullable column, not a rename) specifically
  so the *old* application code keeps working unmodified if a rollback is
  needed, rather than needing the schema rollback and the code rollback to
  happen atomically.

## Monitoring & observability

What already exists, built in Phase 11 and re-verified in this phase's
audit:

- **`GET /api/health`** — unauthenticated `SELECT 1` database check.
  Point an uptime monitor (UptimeRobot, Better Uptime, or the hosting
  platform's own health-check config) at this before launch.
- **`ErrorLog`** (`src/lib/errors/index.ts`'s `captureError()`) — every
  client and server error the app catches gets a row: severity, message,
  stack, path, user context. No external APM/error-tracking SDK — this is
  a deliberate Phase 11 decision (see `docs/architecture.md`), queryable
  directly via `/admin/analytics`'s System Health section or Prisma
  Studio.
- **`PerformanceLog`** (`src/lib/performance/index.ts`'s
  `measureAsync()`) — per-operation timing for recommendation queries,
  search, and other latency-sensitive paths, unsampled.

What's **not** in place and belongs to Phase 14, not this one: alerting
(nothing pages anyone when `/api/health` fails or `ErrorLog` spikes —
today it just accumulates rows someone has to think to look at), log
aggregation beyond Postgres itself, and uptime/synthetic monitoring from
outside the app's own infrastructure.

## Production logging safety

Server-side errors are never returned to the client with a stack trace or
raw database error — see `docs/security.md`'s "Error handling never leaks
internals." `captureError()` does write full stack traces, but only to
`ErrorLog` (server-side, admin-visible only), never to the HTTP response.

## Pre-launch checklist

See `docs/report.md`'s Phase 12 entry (§16, "Recommended final pre-launch
checklist") for the complete list. The short version: rate limiting
(currently absent — see `docs/security.md`), a real CSP, backup/restore
verified against the actual chosen provider, alerting wired to
`/api/health` and `ErrorLog`, and a domain with `AUTH_URL`/OAuth callback
URLs updated to match it exactly.
