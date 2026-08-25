# Phase reports

## Phase 1 — Project Foundation & Architecture

**Status: complete.**

### Summary

Started from an empty repository (only `docs/product-spec.md`, containing
the Phase 1 prompt itself, existed). Scaffolded a Next.js 16 + TypeScript +
Tailwind v4 app, designed and migrated a normalized PostgreSQL + PostGIS
schema, and built the service/architecture layer every later phase depends
on — without building any of the actual product UI (map, festival pages,
destination pages, trip planner, CMS), per the phase's explicit scope.

### Stack (see `architecture.md` for the full rationale)

- Next.js 16 (App Router) + TypeScript, Tailwind CSS v4
- PostgreSQL 16 + PostGIS (local: `docker-compose.yml`), Prisma **6.19.3**
  (deliberately not Prisma 7 — see `architecture.md`, "Prisma version")
- Auth.js v5 (Google OAuth + passwordless email), Prisma adapter
- React Query (server state) + Zustand (guest/UI state)
- MapLibre GL selected for the map, not yet integrated (Phase 3)

### What was built

- **Database**: full schema in `prisma/schema.prisma` — User/Account/Session
  (Auth.js), UserPreference, self-referencing `Location` hierarchy,
  FestivalCategory + Tag taxonomies, Festival + FestivalOccurrence (year
  records with a 5-state date-confidence trail), Destination (with best-time
  + budget), Experience, Food, Event, Media (polymorphic), SavedContent /
  VisitedContent (polymorphic), Trip + TripItem, AnalyticsEvent. Two
  migrations applied: `init` and `search_and_geo_indexes` (trigram + GIST
  indexes, hand-written raw SQL).
- **Service layer** (`src/features/*`): festivals, destinations, map, search,
  recommendations, trips, users, analytics, admin — each a plain typed
  async function module, not tied to React or route handlers.
- **Geospatial layer** (`src/lib/geo`): bounding-box helpers for cheap
  viewport queries, PostGIS raw-SQL helpers for radius/"nearby" queries.
- **Auth**: Google + email magic-link wired end-to-end;
  `src/middleware.ts` gates `/admin` by role.
- **Guest persistence** (`src/lib/guest`): localStorage-backed Zustand
  store + a server-side merge function + `POST /api/guest/merge` route.
- **Design system foundation**: color/typography/radius/shadow tokens in
  `globals.css`; Button, Input, Badge, Card, Skeleton, Modal,
  ResponsivePanel (side-panel-on-desktop / bottom-sheet-on-mobile), Header,
  Footer.
- **Routes**: `/`, `/explore`, `/map`, `/festivals`, `/festivals/[slug]`,
  `/destinations`, `/destinations/[slug]`, `/hidden-india`, `/calendar`,
  `/search`, `/trips`, `/trips/[id]`, `/profile`, `/admin`,
  `/auth/sign-in` — all present; only festivals/destinations
  listing+detail and search render real (seed) data, the rest are
  intentionally minimal per "do not build the UI yet."
- **SEO**: dynamic `sitemap.ts`/`robots.ts`, per-festival/destination
  `generateMetadata` + JSON-LD structured data.
- **Analytics/media**: provider-agnostic adapters (`src/lib/analytics`,
  `src/lib/media`), not tied to a vendor SDK.
- **Seed data** (`prisma/seed.ts`): 9 states, 7 festivals (all 5 categories,
  all 5 date-confidence states), 5 destinations, experiences/food/an event,
  all `isSeed: true`. Idempotent — verified by running it twice.

### Checks performed

- `npm run typecheck` — clean
- `npm run lint` — clean
- `npm run build` — clean production build (18 routes)
- `npx prisma migrate dev` — both migrations applied to a live local
  PostGIS database
- `npm run db:seed` — run twice to confirm idempotency (no duplicate rows)

### Architectural decisions carried forward

- Prisma 6, not 7 (tooling stability at this early a major-version release).
- `Location` is one self-referencing table, not per-level tables.
- Polymorphic `Media`/`SavedContent`/`VisitedContent`/`TripItem` associations
  use `(contentType, contentId)`, not a Prisma relation — see
  `database.md` for why a real FK can't work here.
- Verification/source fields exist on Festival/Destination/FestivalOccurrence
  but are never selected into public-facing service DTOs.

### Known gaps / follow-ups for later phases

- Media storage adapter throws on upload until a real provider (S3/R2/B2)
  is configured — intentional (fails loudly, not silently).
- No automated tests yet (none existed to run; test tooling wasn't set up
  in Phase 1 — worth adding once there's real logic worth covering, e.g. the
  recommendation scorer).
- `npm audit` flags two known advisories in transitive deps
  (`deepmerge-ts` via `@prisma/config`, `nodemailer`'s `raw` option) — both
  are Prisma-CLI/dev-tooling or unused-code-path issues, tracked but not
  blocking; re-check on the next dependency bump.

---

<!-- Phase 2+ reports appended below as each phase completes. -->
