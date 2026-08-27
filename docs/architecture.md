# Architecture

Phase 1 foundation for the TravelDiary India travel discovery platform. This
document explains the shape of the system and the reasoning behind it —
detailed field-by-field schema notes live in [`database.md`](./database.md).

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | SEO (server rendering, metadata API, sitemap/robots), one deployable for UI + API, file-based routing matches the route tree in the spec. |
| Styling | Tailwind CSS v4 | Token-driven design system via `@theme`, no runtime CSS-in-JS cost, fast to keep consistent across many small components. |
| Database | PostgreSQL + PostGIS, Prisma 6 ORM | The content graph (festival↔location↔destination↔event↔...) is relational; PostGIS gives real geospatial queries (`ST_DWithin`, GIST indexes) for the future map. Prisma 6 (not 7) deliberately — see "Prisma version" below. |
| Auth | Auth.js v5 (NextAuth) + Prisma adapter | Google OAuth + passwordless email magic link, both handled by the library — no custom password hashing anywhere in this codebase. |
| Map | MapLibre GL JS + OpenFreeMap (vector, open-source, no API key/billing) | Real, live map since Phase 3 — see "The Living India Map" below. |
| Media | Adapter interface (`src/lib/media`) over S3-compatible storage | No vendor lock-in; local dev/no-credentials mode fails loudly instead of faking success. |
| State | React Query (server state) + Zustand (guest/UI state) | Two different problems, two small tools, instead of one large global store. |
| Deployment (planned) | Vercel (app) + managed Postgres w/ PostGIS (Neon/Supabase/RDS) | Cheap to start, scales without a rewrite. Not provisioned in Phase 1. |

### Prisma version

Prisma 7 (current `latest`) removed `datasource.url` from the schema file in
favor of driver adapters configured in a separate `prisma.config.ts`, and was
only released as a very recent major version at the time of writing. For a
foundation phase, that's added migration-tooling risk without a matching
benefit yet — so this project pins **Prisma 6.19.x** (the LTS-equivalent
prior major), which keeps the conventional `DATABASE_URL`-in-schema
workflow. Revisit this when Prisma 7 has had time to stabilize; the schema
itself doesn't use anything 7-specific, so upgrading later is a tooling
change, not a data-model change.

## Module layout

```
src/
├── app/            # Next.js routes — thin: fetch via features/*, render, done
├── components/
│   ├── ui/          # Design-system primitives (Button, Card, Modal, ...)
│   ├── layout/       # Header, Footer, Container
│   └── {map,festivals,destinations,trips,discovery}/  # Reserved for Phase 2+ (see each folder's README.md)
├── features/        # One folder per domain service boundary (see below)
├── lib/             # Cross-cutting infrastructure, not domain logic
│   ├── db/            # Prisma client singleton
│   ├── auth/           # Auth.js config
│   ├── geo/             # Bounding-box + PostGIS query helpers
│   ├── search/           # Trigram text-filter helper
│   ├── recommendations/   # Scoring types + minimal weighted scorer
│   ├── media/              # Storage adapter interface
│   ├── analytics/           # Provider-agnostic tracking adapter
│   ├── guest/                 # localStorage guest state + account-merge
│   └── validation/             # Shared zod schemas
├── types/            # Cross-cutting ambient types (next-auth augmentation)
└── config/           # env validation, site metadata, nav — never hardcoded in components
```

**Rule of thumb**: `app/` calls `features/*/service.ts`, which calls `lib/db`
(and other `lib/*` helpers) directly. `app/` never imports Prisma directly,
and `features/*` never imports React. This keeps the service layer testable
and reusable if a non-Next.js caller (a cron job, an admin script) ever needs
the same logic.

## Service boundaries (`src/features`)

Each folder is a Phase 1 stand-in for what the spec calls "Festival Service,
Destination Service, ..." — a modular monolith, not microservices. Every
function is plain async TypeScript, scoped and typed, callable from a route
handler, a server component, or (later) a queue worker without change.

- `festivals`, `destinations` — public read services (list/filter/get-by-slug/viewport), status-scoped to `PUBLISHED`.
- `map` — combines festivals + destinations into one normalized marker list for a viewport, with month-based filtering.
- `search` — universal search across festivals/destinations/experiences/food/locations; records zero-result queries.
- `recommendations` — scores destinations against a traveller context, returns top 5 with reasons.
- `trips` — CRUD, always scoped by `userId` (no cross-account access is even expressible).
- `users` — preferences, saved/visited content, and the guest→account merge entry point.
- `analytics` — typed `trackX()` wrappers around the adapter in `lib/analytics`.
- `admin` — `requireAdmin()` guard + the first real admin write path (`verifyFestivalOccurrence`).

## Geospatial architecture

Every content model that has a location carries **both**:

1. `latitude`/`longitude` `Float?` columns with a composite index — the cheap
   path, queried directly through Prisma (`boundingBoxWhere()` in
   `src/lib/geo/bbox.ts`). This is what the map's viewport queries use by
   default.
2. A PostGIS `geography` column (`Unsupported("geography(Point, 4326)")` in
   the Prisma schema, since Prisma has no native geography type), backed by
   a GIST index, queried via `$queryRaw` in `src/lib/geo/distance.ts`
   (`findNearby()`) for actual radius/"nearby" queries.

The map is never expected to load all of India's content into the browser —
`getViewportContent()` in `src/features/map/service.ts` is the one call site
the future map UI will use, and it already takes a bounding box.

## Search architecture

V1 is deliberately "normal search," per the spec: case-insensitive substring
matching (`ILIKE`), accelerated by `pg_trgm` GIN indexes created in the
`search_and_geo_indexes` migration. `src/features/search/service.ts` fans
out one query per content type and merges the results. If this becomes a
bottleneck or relevance quality matters more later, swap the body of that
one function for a call to Meilisearch/Typesense/Postgres full-text search —
call sites don't change.

## Auth & guest persistence

- **Auth.js v5**, database session strategy, Prisma adapter. Providers:
  Google OAuth and passwordless email (magic link via the built-in
  Nodemailer provider) — no password hashing code anywhere in this repo.
- Every route is public by default. Only `/admin` is gated, by **role**
  (`ADMIN`), not just "is signed in" — enforced in `src/middleware.ts`.
- **Guest state** (`src/lib/guest`) lives entirely in `localStorage` via a
  Zustand store (`useGuestStore`) — saved content and draft trips, usable
  with zero account. `src/lib/guest/merge.ts` (server-only — deliberately
  *not* re-exported from the client-safe barrel) reconciles a posted guest
  snapshot into the database once the user signs in, called from
  `POST /api/guest/merge`.

## Analytics & media

Both are adapter-pattern abstractions (`AnalyticsAdapter`,
`MediaStorageAdapter`) so no vendor SDK is imported outside one file. The
default analytics provider persists to the `AnalyticsEvent` table
(self-hosted, fine at V1 volume); switch `ANALYTICS_PROVIDER` to swap it.
Media storage is a real interface with a deliberately-throwing stub
implementation — it fails loudly until real credentials/provider code are
wired up, rather than silently no-op-ing.

## SEO

- `app/sitemap.ts` and `app/robots.ts` are dynamic and query the database —
  only `PUBLISHED` festivals/destinations become URLs, never generated/fake
  pages.
- `/festivals/[slug]` and `/destinations/[slug]` have `generateMetadata`
  (title, description, canonical, Open Graph) and inline JSON-LD structured
  data, with a bare `<` → `<` escape so admin-authored description text
  can never prematurely close the `<script>` tag it's embedded in.
- Account-scoped/query pages (`/trips`, `/profile`, `/search`, `/admin`) are
  `robots: { index: false }`.

## The Living India Map (Phase 3)

**Stack**: MapLibre GL JS 6, styled with [OpenFreeMap](https://openfreemap.org)'s
`positron` style (free, keyless, unlimited — no Mapbox/MapTiler account or
billing to configure). State/UT boundaries are Natural Earth's admin-1
dataset (public domain, redistribution-safe — deliberately *not* one of the
commonly-linked "India states GeoJSON" repos, which turn out to be
GADM-derived and prohibit commercial redistribution; see
`public/geo/SOURCE.md`).

**Architecture**: `src/components/map/MapCanvas.tsx` owns the MapLibre
instance imperatively (`useEffect`, mount-once) and is the only file that
touches the `maplibre-gl` API directly; `src/app/map/MapPageClient.tsx`
owns all the React state (month, active layers, selected discovery/state,
viewport) and never imports `maplibre-gl` itself. Discovery markers and
clustering use MapLibre's native `cluster: true` GeoJSON source support —
no `supercluster` or other clustering dependency needed. Layer toggling
(Festivals/Destinations/Hidden Gems/Experiences/Food-Events) filters the
in-memory discovery list client-side and calls `source.setData()` — no
network round-trip per toggle, and clustering re-runs correctly on the
filtered set since it operates on whatever's in the source.

**Data flow**: `GET /api/map/viewport` (bbox + optional month →
`getViewportContent()` in `src/features/map/service.ts`) is the only
network call driven by panning/zooming, debounced 300ms on `moveend`.
Clicking a marker fetches a small per-item preview via
`GET /api/map/discovery`, kept separate from the viewport payload so that
stays lightweight even with hundreds of markers in view. Clicking a state
boundary fetches counts via `GET /api/map/state/[slug]`.

**Map state preservation**: current center/zoom/month are written to the
URL (`?lat=&lng=&zoom=&month=`) via `history.replaceState` — deliberately
*not* through `next/navigation`'s router, since that would re-run an RSC
fetch on every pan. Reading it back on load takes a specific hydration
precaution: see "Two confirmed bugs" below.

**"Hidden Gems" needed a schema change**: the layer requires destinations
to carry a popularity/hidden classification the same way festivals already
did, which Phase 1's schema didn't have. Rather than bolt on a
destination-only concept, `ContentPopularity` (renamed from
`FestivalPopularity`, migration `20260827202945`) is now shared by both
`Festival.popularity` and `Destination.popularity`.

### Two confirmed bugs, both fixed

Building this surfaced two real, reproducible bugs — not environment
flakiness — worth recording since they'll bite again if the map code is
touched carelessly:

1. **Turbopack breaks MapLibre's Web Worker.** Next.js 16's default
   bundler doesn't correctly resolve maplibre-gl's internal tile-parsing
   worker module when it's left to load the normal bundler-relative way —
   the map silently never fires `load`/`idle`, no tiles ever request, and
   nothing throws. Fix: `maplibre-gl-worker.mjs` + its sibling
   `maplibre-gl-shared.mjs` are copied verbatim into `public/maplibre/` as
   plain static files, and `setWorkerUrl()` points at them before any `Map`
   is constructed (see the top of `MapCanvas.tsx` and
   `public/maplibre/README.md`). Re-copy both files after bumping
   `maplibre-gl`.
2. **MapLibre's own CSS silently wins a Tailwind class fight.**
   `maplibre-gl.css` sets `.maplibregl-map { position: relative }`; at
   equal selector specificity, whichever stylesheet loads later in the
   cascade wins, which in this bundle is maplibre-gl's — so a container
   styled `absolute inset-0` collapses to zero height the moment MapLibre
   initializes (`inset-0` does nothing once `position` isn't
   absolute/fixed). Fixed by sizing the container with `h-full w-full`
   against its already-sized flex parent instead of relying on `absolute`
   positioning at all.

Both were caught by driving a real headless-Chromium session against the
production build (not just `tsc`/`eslint`/`next build` passing) —
worth remembering next time "it builds cleanly" feels like enough.

## Known trade-offs

- **Polymorphic associations** (`Media`, `SavedContent`, `VisitedContent`,
  `TripItem.contentId`) use a `(contentType, contentId)` pair instead of a
  real foreign key — Postgres/Prisma has no native polymorphic FK, and a
  single column cannot validly reference four different tables at once.
  Integrity for these is enforced in the service layer, not the database.
  This is the one place a bad `contentId` wouldn't be caught by a
  constraint — documented on the `Media` model in `schema.prisma`.
- **Location hierarchy** is one self-referencing table (`type` +
  `parentId`) rather than separate `Country`/`State`/`City` tables, so
  adding a new administrative level never requires a migration.
