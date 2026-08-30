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

- `festivals` — public read services (list/filter/get-by-slug/viewport), status-scoped to `PUBLISHED`; since Phase 4 also owns the discovery feed (`getFestivalDiscoveryFeed`), ranking (`ranking.ts`), temporal status (`status.ts`) and geo-nearby (`getNearbyToFestival`).
- `destinations` — same shape, since Phase 5: discovery feed (`getDestinationDiscoveryFeed`), ranking (`ranking.ts` — same weighting philosophy as festivals', seasonal-window match instead of temporal status), `seasonal.ts` (`isInSeason`/`formatMonthRange`) and geo-nearby (`getNearbyToDestination`).
- `locations` — small shared helper (`getLocationIdsForState`) that resolves a state slug to itself + every child city/region id, used by both `festivals` and `destinations` for `?state=` filtering and by `map`'s state-summary panel — added once the same "festivals in this state" logic was needed in three places.
- `map` — combines festivals + destinations into one normalized marker list for a viewport, with month-based filtering.
- `search` — universal search across festivals/destinations/experiences/food/locations; records zero-result queries.
- `recommendations` — scores destinations against a traveller context, returns top 5 with reasons.
- `trips` — CRUD, always scoped by `userId` (no cross-account access is even expressible).
- `users` — preferences, saved/visited content (`toggleVisitedContent` — a real toggle since Phase 4, not the Phase 1 upsert-only `markVisited`), and the guest→account merge entry point.
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

## Content actions: `src/components/discovery` (Phase 4)

Save/Visited/Add-to-Trip/Share started as bespoke JSX inside the map's
discovery panel in Phase 3. Phase 4 needed the same actions on the festival
detail page, so they moved to `src/components/discovery` as
`SaveButton`/`VisitedButton`/`AddToTripButton`/`ShareButton` (plus their
`useSavedState`/`useVisitedState` hooks) — one implementation, not two kept
in sync by hand. Phase 5 followed the same move for `Gallery` (was
`FestivalGallery`, now `src/components/ui/Gallery.tsx`), `NearbyDiscovery`
(now `src/components/discovery`, already content-agnostic), and the
listing-page filter links (`FestivalMonthFilter`/`FestivalFilterPills` →
`src/components/ui/{MonthFilterLinks,FilterPillLinks}.tsx`, taking a
`basePath` prop instead of hardcoding `/festivals`). The rule going
forward: a second content type needing the same UI is the signal to
generalize and relocate, not the signal to copy-paste — do it right when
the second consumer shows up, not preemptively for a hypothetical third.

## Static rendering can silently freeze a "live" content page

`/hidden-india` (Phase 5) fetches straight from the database with no
`searchParams`/`cookies()`/other dynamic API — which is exactly the
condition under which Next.js statically prerenders a page **at build
time** and serves that frozen HTML to every visitor until the next deploy.
Caught by reading the `next build` route table (`○` vs `ƒ`), not by any
test: a fresh festival added to Hidden India after deploy simply wouldn't
appear. Fixed with `export const dynamic = "force-dynamic"`. The sitemap
(`src/app/sitemap.ts`) has the identical structural risk — same DB call, no
dynamic API — but doesn't need per-request freshness (crawlers don't care
about minute-level staleness), so it got `export const revalidate = 3600`
(ISR) instead of full dynamic rendering. General rule for this codebase:
any page/route that queries the database directly (not through a
`searchParams`-driven filter, which already forces dynamic rendering) needs
one of these two exports — check the build's route table after adding a
new one, don't assume.

## Reading URL state in a client component: `useSearchParams()`, not `window.location`

`src/app/map/MapPageClient.tsx` originally read its `?lat&lng&month` state
via `window.location.search` inside a `useState` lazy initializer. That's
correct on a hard navigation/reload, but breaks on a Next.js **client-side**
navigation (e.g. a `<Link>` from another page): instrumented logging showed
`location.search` was still empty at the exact moment the target page's
component first rendered — Next mounts the new route's components
essentially concurrently with, not strictly after, updating
`window.location`. The fix was `next/navigation`'s `useSearchParams()`,
which stays in sync with the router instead of the raw browser API (and
requires the reading component to sit under a `<Suspense>` boundary, now in
`src/app/map/page.tsx`). General lesson for this codebase: any client
component that needs the *current* URL's search params should use
`useSearchParams()`, never a direct `window.location` read — the latter
only reliably matches the rendered route on a full page load.

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

## Discovery context is the URL, not a store (Phase 6)

Phase 6 asked for a "shared discovery context" (month + geography) that
survives navigation between Search, Calendar, Map, Festivals, Destinations
and Explore. Every one of those pages already treated `?month=`/`?state=`
in its own URL as the source of truth (Phase 3's map, Phase 4/5's
`/festivals`/`/destinations`) — so rather than introduce a Zustand store
duplicating that state, `src/features/discovery/context.ts` is just a set of
pure `xHref(ctx)` functions that build one page's URL from another's
context. The "shared context" is the URL itself; this module is only the
one place that assembles cross-page links out of it, so `/calendar` and
`/map` don't each hand-roll their own query-string logic. Per the spec's own
"do not put every UI state into global state" — this was a case for less
state, not a new store.

## Calendar ↔ Map needed a real bug fix, not just new pages

Making "Explore October on Map" (Calendar → Map) actually land on October
exposed a latent gap in `MapPageClient.tsx`'s URL-state parsing: the old
`parseUrlState` returned a single object and required `lat`+`lng`+`zoom` to
all be present before it would read `month` *at all* — so a link with only
`?month=10` (no viewport, since Calendar has no map camera to hand off)
silently fell back to the current month instead. Fixed by splitting it into
two independent parsers, `parseViewState` (lat/lng/zoom, still requires all
three) and `parseMonthParam` (reads `month` regardless of whether a
viewport is present, returning `undefined` — not `null` — when the URL has
no `month` key at all, so the effect that applies it doesn't clobber the
default). The reverse direction (Map → Calendar, a "View October Festivals"
link next to `MonthSelector`) needed no equivalent fix since `/calendar`
already treated `?month=` as authoritative on its own.

## Universal search: tiered relevance + pg_trgm typo tolerance, not a search engine

`src/features/search/service.ts` fetches a superset per content type (name
OR location-name OR tag OR description match, via one `OR` clause each —
the trigram-indexed `name` columns from the `search_and_geo_indexes`
migration keep this fast without a dedicated index), then ranks in JS with
a transparent tier: exact/prefix/substring name match ranks above a
location-name match, which ranks above any other OR-clause match (tag or
description — deliberately not distinguished, to avoid a second query just
to attribute *which* field matched), with a small popularity/editorial
bonus layered on top — the same "transparent weighted sum" shape as the
festival/destination ranking heuristics, not a black box.

Typo tolerance ("Munnar" should still work for "Munaar") reuses
infrastructure that already existed rather than adding a new one: when a
content type's plain match comes back empty, `fuzzyMatchIds()` runs a
`similarity(name, query) > 0.25` query via `pg_trgm` (already enabled in the
`init` migration, already indexed) and re-selects full rows for whatever it
finds, in similarity order. This only fires per-content-type on zero
results, so a query that already matches normally never pays for the
fallback. Deliberately not a spelling-correction system — the spec's own
"do not build a complex AI spelling correction system."

## Two small primitives replace ad hoc click tracking: `TrackedLink`, `TrackedCardWrapper`

Search result clicks, Calendar's "festival clicked"/"map CTA clicked", and
Explore's per-section CTAs all needed the same shape: fire one analytics
event, then navigate. Rather than a bespoke `onClick` at every call site,
`src/components/discovery/TrackedLink.tsx` wraps `next/link` with an
`event` prop, and `TrackedCardWrapper.tsx` wraps a plain click-analytics
`div` around a card whose only interactive surface is its own internal
`Link` (`FestivalCard`/`DestinationCard`, so they don't need
tracking-specific variants). Both were written once Calendar *and* Explore
needed the identical pattern — the same "generalize on the second real
consumer" rule Phase 4/5 used for `src/components/discovery`.

## `useDebouncedValue`: extracted, not invented

The map's search box (Phase 3) already debounced its query with an inline
`useEffect`+`setTimeout`. The header's universal search overlay needed the
same behavior, so the timer moved to `src/lib/hooks/useDebouncedValue.ts`
and `MapSearch.tsx` was refactored to use it too — a second consumer
appearing is what triggered the extraction, not a preemptive "shared hooks"
folder. One non-obvious wrinkle both consumers share: the "query too short,
clear results" branch must never call `setState` synchronously in the
effect body (React's `react-hooks/set-state-in-effect` lint rule, first hit
in Phase 3's original map search). The fix here is structural rather than
an `eslint-disable`: the effect simply returns early below the minimum
length without touching state, and the *render* gates on the trimmed
query's length instead — so the only `setState` call left in either effect
is inside the fetch's `.then()`, and stale `results` state is simply never
displayed rather than needing to be cleared.

## Analytics event types added, reusing the `metadata.action` pattern

Four new `AnalyticsEventType` values (`SEARCH_OPENED`,
`SEARCH_RESULT_CLICK`, `CALENDAR_INTERACTION`, `EXPLORE_INTERACTION`) cover
the spec's search/calendar/explore analytics — but `CALENDAR_INTERACTION`
and `EXPLORE_INTERACTION` are each one generic type distinguished by
`metadata.action` (`"month_selected"`, `"map_cta_clicked"`,
`"festival_clicked"`, `"discovery_clicked"`, ...), the same shape
`MAP_INTERACTION` already used in Phase 3, rather than a dedicated enum
value per distinct action. "Search refinement" (spec's search analytics
list) is deliberately *not* a separate tracked event — `AnalyticsEvent` has
no session concept, so a second `SEARCH_QUERY` close in time to a first one
is already a refinement in the data; adding an event just to restate that
would be the "excessive analytics events that provide no meaningful
insight" the spec warns against.

## Recommendation engine: transparent weighted scoring, not a model (Phase 7)

`src/features/recommendations/` is the whole engine: `weights.ts` (every
number, centrally configurable — spec §39's "do not hardcode weights in
multiple components"), `scoring.ts` (per-signal functions each returning
0..1, composed into one weighted sum per `DEFAULT_WEIGHTS`), `explain.ts`
(deterministic threshold → reason-string rules, never an LLM), `diversity.ts`
(greedy top-N selection with a soft per-category/per-geography cap), and
`service.ts` (`recommendDestinations`/`recommendFestivals`/`recommendNearby`
— the three functions §38 asks for by name). Nothing here is a black box:
`matchPercent` is `Math.round(score * 100)` of the same weighted sum a
developer can read top to bottom in `scoring.ts`.

The two-path shape every one of the three service functions follows:

```
No personalization signal (hasPersonalizationSignal() is false)
      → wrap the *existing* anonymous ranking (Phase 5/6's
        getDestinationDiscoveryFeed/getFestivalDiscoveryFeed, already
        reused, not reimplemented) with honest, signal-based reasons and
        matchPercent: null — never a fabricated percentage (spec §24/§45).

Real signal present (interests, travel style, budget, duration, or crowd
preference set — by an authenticated user's UserPreference row, or a
guest's local store)
      → score every candidate against scoreDestination/scoreFestival,
        explain via explain.ts, pick a diverse top N via diversity.ts.
```

`hasPersonalizationSignal()` is the one gate deciding which path runs — it
deliberately does not fire the scored path just because a `month` or
`stateSlug` is present, since those are page *context*, not traveller
*preference*, and scoring against nothing but context would just reproduce
the anonymous ranking while lying about having a match score.

## Guests get personalization too, not just an anonymous fallback

The spec's own examples (§24: "Best for October", never "Personalized for
you", for anonymous users) are about *unset* preferences, not about being
signed out — §43 explicitly has guests optionally setting preferences and
merging them into an account later. So personalization here is keyed on
*whether real preference data exists*, not on `session`:

- **Server-rendered surfaces** (festival/destination detail pages'
  "Recommended Nearby") only personalize for signed-in visitors, since the
  server can see a `UserPreference` row but never a guest's localStorage.
  Guests keep the unchanged Phase 4/5 plain nearby list here — a deliberate
  scope trim (see `docs/report.md`), not an oversight.
- **Client-rendered surfaces** (Explore's recommendation rail) personalize
  for *both* — signed-in requests are scored server-side against the real
  `UserPreference` row (client-supplied personalization fields are ignored
  entirely for these, spec §49); guest requests carry whatever the visitor
  set locally (`src/lib/guest/store.ts`) in the POST body, since that data
  only ever describes the requester themself and carries no comparable
  trust requirement. This is *why* the rail is a client component at all
  (see "Analytics/caching" below) rather than server-rendered like the rest
  of `/explore`.

## Two Server→Client boundary bugs, both caught by driving the real page

1. **A Server Component passed a function prop to a Client Component.**
   `OnboardingLauncher`'s `renderTrigger` prop is a function — fine when the
   *caller* is itself a Client Component (`RecommendationRail`), but
   `/profile` is a Server Component, and React Server Components cannot
   serialize a function across that boundary ("Functions cannot be passed
   directly to Client Components"). This didn't show up in `next build` or
   `tsc` — TypeScript doesn't know about the RSC serialization boundary —
   only in the server's runtime log and a crashed `/profile` render for
   signed-in users. Fixed with `src/app/profile/PreferencesEditor.tsx`, a
   thin Client Component that receives only serializable props from the
   server and builds the function-valued `renderTrigger` itself, entirely
   client-side. General rule for this codebase: a `renderTrigger`/render-
   prop-shaped prop on a Client Component may only be supplied by another
   Client Component, never directly by a page.
2. **A new analytics event type reached the enum but not the Zod schema.**
   `RECOMMENDATION_VIEWED` (and Phase 7's other two new types) were added to
   `prisma/schema.prisma` and the migration, but `src/lib/validation/map.ts`'s
   `analyticsEventSchema` — the *separate* list `/api/analytics/track`
   actually validates client-submitted events against — wasn't updated in
   the same pass. Every `RECOMMENDATION_VIEWED` event silently 400'd. Caught
   by logging every failed network response during browser verification,
   not by any type check (Zod's `z.enum([...])` is a plain string literal
   list, structurally unrelated to the Prisma enum it's meant to mirror).
   No structural fix applied — same failure mode as Phase 6's four event
   types, which were added to both places together; this is a "remember to
   grep for `analyticsEventSchema` when adding an event type" discipline
   note, not a bug worth introducing a code-generation step to prevent.

## Two small, deliberate scope trims

- **Map personalization** (spec §32: "integrate with the existing map
  relevance service") — not wired this phase. The map's own viewport/
  discovery ranking (Phase 3) is untouched; feeding a signed-in viewer's
  preferences into it would mean either a client round-trip on every
  viewport change or duplicating the map's ranking query, and the spec's
  own hedge ("for now, integrate...") reads as loose guidance rather than a
  hard requirement. Documented here rather than silently skipped.
- **Destination-recommendation UI is destination-only on Explore.** Spec
  §13 lists festival recommendations as a required type too, and
  `recommendFestivals` is real, tested code — exercised by
  `recommendNearby` on both detail pages — but Explore's single "Top 5"
  rail (spec §20's own worked example is all destinations: "1. Meghalaya
  2. Hampi...") stayed destinations-only rather than adding a second,
  visually competing "Recommended Festivals" rail on the same page.

## `middleware.ts` doesn't exist in Next.js 16 — it's `proxy.ts` now (a documentation staleness, not a security hole)

Two files' comments (`src/lib/auth/config.ts`, `src/app/admin/page.tsx`)
claimed `/admin` was "gated in middleware.ts." No such file exists in the
repo — but `src/proxy.ts` does, committed back in Phase 2, with correct
logic gating `/admin` behind the `ADMIN` role. `node_modules/next/dist/
docs/.../middleware.md` explains the naming: Next.js 16 deprecated and
renamed the `middleware.ts` convention to `proxy.ts` (same runtime, same
execution model, just a different file/export name) — Phase 2 already used
the correct post-rename name; the two comments elsewhere just never got
updated to match. **Initially misdiagnosed as a missing security guard**:
searching for `middleware.ts` (finding nothing) was taken as confirmation
`/admin` was unprotected, without independently checking for `proxy.ts`
under its correct name — an incomplete search, not a real gap. Once the
bundled docs surfaced the rename (exactly the class of breaking change
AGENTS.md warns about for this specific Next.js version), re-checking
found the genuinely-correct existing file, and `git log -- src/proxy.ts`
confirmed it dates to Phase 2. `/admin` has been correctly protected the
entire time. The actual, real fix here is narrower: the two stale
comments, corrected to point at `proxy.ts`, plus a rewrite of
`src/proxy.ts` itself with clearer documentation of *why* it's named that
way and why the Node.js runtime (new in Phase 2's version of Next, "Proxy
defaults to using the Node.js runtime" vs. the old Middleware's Edge-only
runtime) is what makes `auth()`'s database-session Prisma query usable
inside it at all — a genuine clarity improvement, not a behavior change.

## A Zustand + streaming-SSR hydration bug, and why the "obvious" fix wasn't enough

Testing "guest saves something, then refreshes" (spec §48's own guest
lifecycle test) surfaced a real React hydration mismatch (error #418) —
verified with a minimal repro (pre-seed `localStorage` before any page
ever loads, then load once) that isolated it to "guest store has non-empty
data at the moment of hydration," independent of reload vs. first load.

The first fix — `persist(..., { skipHydration: true })` plus an explicit
`useGuestStore.persist.rehydrate()` call in a `GuestStoreHydrator` effect
mounted near the root — was the textbook answer, and **it wasn't enough**.
It's built on an assumption that doesn't hold under Next.js's default
streaming/selective hydration: that the *whole tree* finishes hydrating
(matching server HTML) before *any* component's effects run. In practice a
component higher in the tree (`GuestStoreHydrator`, near the root) can have
its effect fire and rehydrate the *shared* store before a component
further down — `SaveButton` inside a page's streamed content — has
finished its own hydration pass against its own server-rendered HTML,
producing exactly the mismatch this was meant to prevent.

The actual fix layers a second, independent guard on top:
`src/lib/hooks/useHasHydrated.ts`, a plain `useState(false)` flipped to
`true` in the *consuming* component's own effect. `SaveButton`/
`VisitedButton` (via `useSavedState`/`useVisitedState`) render the same
"not saved" default the server used until their own `hasHydrated` is
true, regardless of what the shared store already holds — this doesn't
depend on any cross-component timing assumption, only on React's guarantee
that a component's own render-before-its-own-effect ordering is stable.
`skipHydration` + `GuestStoreHydrator` are kept too — they're still correct
and useful for preventing the *global* store from mutating prematurely for
components that don't need the extra guard (e.g. `GuestMergeSync` already
awaits `rehydrate()` explicitly before reading state) — but they are not,
by themselves, sufficient for anything that renders the store's data
directly. Verified fixed against the exact repro (pre-seeded localStorage,
first load) and the full guest → save → visited → reload flow, in the
production build, not dev mode (which didn't reliably reproduce the race
in the first place — consistent with a streaming-timing bug being harder
to hit under dev's slower, differently-instrumented request handling).

## The recommendation engine is now saved/visited-aware (Phase 8)

Spec §35 ("avoid repeatedly recommending items visited... do not
completely exclude saved items automatically") is implemented as a mild
score multiplier, not a hard filter: `RecommendationContext.userId` (set
only from the server-side session, never client input) lets
`recommendDestinations`/`recommendFestivals` look up the viewer's visited
content for that type and apply a `×0.6` penalty in the final score before
diversity selection — a visited destination can still appear (and would,
if nothing else beats it), it just doesn't dominate. Saved content
receives no penalty at all, matching "do not completely exclude." Applied
on the *personalized/scored* path only; the anonymous fallback path
doesn't currently reorder by visited status, a minor known gap over
building a second reordering step for a path that already isn't
personalized.
