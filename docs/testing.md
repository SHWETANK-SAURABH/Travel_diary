# Testing

Phase 12 added the test suite this project didn't have before — see
[`report.md`](./report.md) for the full phase writeup. Two layers, kept
deliberately separate rather than one framework doing both jobs:

| | Unit (Vitest) | E2E (Playwright) |
|---|---|---|
| Lives in | `src/**/*.test.ts` | `tests/e2e/*.spec.ts` |
| Runs against | Nothing — pure functions, DB calls mocked | A real `next start` build + real Postgres |
| Speed | ~1s for the whole suite | ~15–30s for the whole suite |
| Command | `npm run test` | `npm run test:e2e` |
| Catches | Logic bugs in isolation (date math, scoring, budget ranges) | Wiring bugs across the stack (auth, DB, routing, rendering, hydration) |

Neither is a substitute for the other. Unit tests can't catch a broken
Server Action or a caching bug; E2E tests are too slow and too coarse-grained
to pin down exactly *why* a date calculation is off by one.

## Unit tests

Configured in `vitest.config.mts` (`.mts`, not `.ts`, so Vite loads it as
real ESM instead of warning about CJS interop — see git history if this
ever regresses). Covers pure logic that's easy to get subtly wrong and hard
to eyeball-verify: festival temporal status (`resolveFestivalStatus`,
`daysUntil`), seasonal fit, recommendation scoring/diversity/explanation,
trip budget estimation, slug generation, search query normalization, month
range math.

The one function with a DB call in this set (`estimateTripBudget`) is
tested with `vi.mock("@/lib/db", ...)` rather than a real database — see
`src/features/trips/budget.test.ts`. That's the exception, not the pattern:
most of `src/features` does real I/O and belongs in the E2E suite instead,
not behind a growing wall of Prisma mocks that drift from the real schema.

Run: `npm run test` (single run) or `npm run test:watch` (watch mode while
iterating).

### A real bug this suite caught

`resolveFestivalStatus` and `daysUntil` (`src/features/festivals/status.ts`)
originally did raw millisecond arithmetic — `now <= endDate` and
`Math.ceil((date - now) / msPerDay)`. Since occurrence dates are
admin-entered calendar days stored as UTC midnight (no meaningful
time-of-day), that arithmetic quietly broke on the day boundary itself: a
single-day festival flipped from "Happening Now" to "Past" the moment UTC
midnight ticked over on its own day — hours before the day it was naming
had actually finished for anyone in an India timezone — and `Countdown`
could show "1 day to go" for something happening later that same day. Fixed
by comparing whole UTC calendar days instead of raw timestamps. Two of the
first 78 unit tests written caught this immediately; it had been live,
unnoticed, since whichever phase first wrote `status.ts`.

## E2E tests

Configured in `playwright.config.ts`: single Chromium project, one worker
(these tests share a database and mutate real rows — parallel workers would
race each other), a `webServer` block that runs `npm run start` against
whatever's already built and reuses an already-running server outside CI.

`tests/e2e/helpers/session.ts` authenticates without a real OAuth flow:
`session: { strategy: "database" }` (`src/lib/auth/config.ts`) means
Auth.js looks up whatever raw string is in the session cookie against
`Session.sessionToken` in Postgres, so a test can write that row directly
and hand Playwright the cookie — functionally identical to what a real
sign-in leaves in the browser once its redirect completes, with no browser
automation of Google's login UI. `ensureUser()` upserts a dedicated
`e2e-*@example.com` fixture account rather than reusing any real or
manually-created account, so the suite is self-sufficient against a fresh
`db:seed`, not dependent on whatever accounts happen to exist locally.

Three spec files, matching the three journeys spec §64 ("FINAL PRODUCT
AUDIT") names explicitly:

- **`primary-journey.spec.ts`** — Homepage → Explore → Map → Festival →
  Save → Trip (create, add a second item, reorder) → Share, ending by
  opening the share link in a fresh unauthenticated browser context to
  confirm the public page actually renders it. Runs signed-in, not as a
  guest — sharing needs a server-side trip row (guest trips are
  localStorage-only), and reordering uses the accessible Move up/down
  controls, never drag-and-drop (spec §13/§53).
- **`search.spec.ts`** — Search → Result → Content, plus the empty-state
  path for a query with no matches.
- **`admin-publish.spec.ts`** — Admin → Edit content → Publish → Public
  page updated. The fixture festival is written directly via Prisma (not
  through the admin create form's `RelationPicker` autocomplete) so the
  test exercises what it's actually meant to check — the publish action
  and its effect on the public page — rather than coupling to unrelated
  form UI.

Every spec that mutates state cleans up its own fixtures in `beforeAll`
(not `afterAll`) — deletes anything left by a previous run before creating
fresh rows, rather than assuming a pristine database. This was learned the
hard way: the first version of `primary-journey.spec.ts` passed once, then
failed on the very next run, because `getByRole("button", { name: "Save" })`
substring-matches an already-`"Saved"` button just as well as an unsaved
`"Save"` one, and the second run's click silently un-saved what the first
run had saved. Fixed with `exact: true` and an explicit pre-test cleanup —
see the git history on `tests/e2e/primary-journey.spec.ts` if this pattern
needs revisiting elsewhere.

Run: `npm run test:e2e`. Needs a built app (`npm run build`) and a running
Postgres with migrations applied and seed data loaded — `docker compose up
-d && npx prisma migrate deploy && npm run db:seed` gets there locally; CI
does the equivalent against a service container (see below).

## A framework quirk this suite surfaced, already documented

A fresh `notFound()` call (any of them — festival/destination/trip detail,
the trip share page) returns HTTP `200`, not `404`, when checked with a
raw request. This is expected Next.js 16 behavior, not a bug in this
app — see `node_modules/next/dist/docs/01-app/03-api-reference/
04-functions/not-found.md`: Cache Components stream a static shell before
`notFound()` can run, so the status can't retroactively change once
streaming has started. Next compensates with an auto-injected
`<meta name="robots" content="noindex">`, which is what
`tests/e2e/admin-publish.spec.ts`'s draft-festival test actually asserts on
instead of the status code. This exact characteristic was already found and
documented back in Phase 9 (`architecture.md`'s "A transport-level nuance
in `notFound()`") — Phase 12 just re-confirmed it applies here too, via a
different route.

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`: install →
generate Prisma client → lint → typecheck → migrate a Postgres+PostGIS
service container → seed it → unit tests → production build → install
Playwright's Chromium → E2E tests. The Postgres service image
(`postgis/postgis:16-3.4-alpine`) matches `docker-compose.yml`'s local dev
image exactly, since the schema depends on the `geography` column type
(see [`database.md`](./database.md#geospatial-columns)) that plain
`postgres` images don't have. A failed E2E run uploads its Playwright HTML
report as a build artifact for post-mortem.
