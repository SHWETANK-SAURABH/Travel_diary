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

## Phase 9: one presentational trip editor, two data-backed wrappers

`src/app/trips/[id]/TripPlannerView.tsx` is the entire itinerary editor UI
(day columns, item cards, map, budget, conflicts, suggestions, meta-edit
form) as a single client component that knows nothing about where its data
comes from — every mutation is a callback prop. Two thin wrappers supply
those callbacks against two different backends:

- `AccountTripEditor` — every mutation hits an API route. Reordering is
  optimistic-local-only (no refetch: order never changes budget, conflicts,
  or suggestions, so refetching on every arrow click would be pure waste —
  spec §49's "do not send the entire trip object on every small reorder").
  Everything else (add/remove item, move day, edit meta) does a local
  optimistic update *and* a full `GET /api/trips/[id]` refresh afterward,
  since those genuinely can move the budget/conflict/suggestion numbers and
  there's no cheaper way to know by how much without recomputing server-side.
- `GuestTripEditor` — the trip itself lives in the Zustand guest store
  (Phase 8), but budget/conflicts/suggestions need data guest localStorage
  doesn't have (destination cost data, festival occurrence dates,
  geo-proximity queries) — so it fetches them from two no-auth endpoints,
  `POST /api/trips/resolve` (existing, content display) and
  `POST /api/trips/insights` (new). Both endpoints only ever return
  already-public content data, the same trust boundary already established
  for `/api/trips/resolve`.

Both endpoints, and `GET /api/trips/[id]`'s own budget/conflict/suggestion
fields, are backed by one function —
`getTripInsights()` in `src/features/trips/service.ts` — so an account
trip and a guest trip run through *identical* heuristics. It's deliberately
DB-row-agnostic (takes a plain `{startDate, endDate, days, travellerCount,
items}` shape, not a Prisma `Trip`), which is what makes a guest itinerary
— which has no Trip row at all — able to use it.

### Day management without a `days` field you can just increment

`Trip.days`/`GuestTripDraft.days` is *derived* from `startDate`/`endDate`
whenever both are set (`computeTripDays`, Phase 9's foundation) — so once a
trip has explicit dates, patching `{days: n}` directly is silently
overwritten by the recompute. "Add day" / "Remove day" therefore can't
just increment a counter; `applyDayCountDelta()`
(`src/lib/trip/duration.ts`) is the shared fix, used by both editors: if
the trip has both dates, it extends/shrinks `endDate` by one day instead
(clamped so it never crosses back before `startDate`); if it doesn't, it
patches `days` directly, since there's nothing to overwrite it. One
function, so guest and account trips grow/shrink identically.

### Sharing: PUBLIC and UNLISTED are the same read grant

`getSharedTrip()` (renamed from an earlier, narrower `getPublicTrip()`)
matches `visibility: { in: ["PUBLIC", "UNLISTED"] } }` — both grant read
access to `/trips/[id]/share`; they differ only in discoverability (PUBLIC
could in principle be listed/indexed somewhere later, UNLISTED never is —
today neither actually is, so in practice the difference is purely
semantic intent). Getting this wrong the other way (checking `PUBLIC`
only, which is what the field was initially named after) would have been a
real bug: the "Share" button auto-upgrades a `PRIVATE` trip to `UNLISTED`
(never straight to `PUBLIC` — sharing a link shouldn't silently opt a trip
into whatever "public" comes to mean later), so a share-link-only flow
would have 404'd on its own freshly-copied link if `getSharedTrip` still
excluded `UNLISTED`. Caught and fixed before it shipped, not after —
verified via a dedicated headless-browser check (private trip's `/share`
route → the app's not-found page, no trip data leaked; freshly-unlisted
trip's `/share` route → fully renders for a signed-out request).

### A transport-level nuance in `notFound()`, discovered while testing sharing

Verifying "private trip's `/share` link should 404" via a raw
`page.request.get()` (no JS execution) initially looked like a bug: the
HTTP status came back `200`, not `404`. It isn't one — a real browser
correctly renders the app's not-found page (confirmed via a second check
that actually loads and reads the page), and the *same* `curl` check
against an unrelated, pre-existing `notFound()` call (`/destinations/
<nonexistent-slug>`) shows the identical `200`. This is a whole-app,
pre-Phase-9 characteristic of how Next.js's streaming response works when
a route segment is wrapped in a `Suspense` boundary higher up the tree (the
root layout, in this app's case): the response's HTTP status is committed
with the initial shell, before the inner page component's `notFound()`
call is even reached, so it can't retroactively become a 404 once the
stream is already flowing. Functionally correct for real users (who run
JS and see the right content); a known, cosmetic gap for anything that
inspects the raw status code (bots, `curl`, link checkers) — noted here
rather than "fixed" since restructuring the whole app's Suspense
boundaries is out of scope for a trip-sharing feature.

## Phase 10: the Admin CMS is Server Actions, not API routes — a deliberate departure

Every prior phase's mutations went through `src/app/api/**/route.ts` —
`fetch()` from a client component, `NextResponse.json(...)` back. The
admin CMS instead uses [Server Actions](https://nextjs.org/docs/app/guides/server-actions)
(`"use server"` files under each `src/app/admin/<entity>/actions.ts`),
called directly from client form components as plain async functions.
Two reasons this isn't "inconsistent for its own sake":

1. **The forms don't serialize cleanly to `FormData`.** Every admin form
   carries nested array state (`tagIds: string[]`, relationship chip
   lists) that a native `<form action>` + `FormData` parse would need
   manual reconstruction for anyway — passing a plain typed object
   straight to a Server Action (an explicitly supported invocation shape,
   not a hack) is simpler and type-safe end to end, no `FormData.get()`
   parsing/casting at all.
2. **Next.js 16's own guidance treats this as the current idiom** for
   exactly this shape of problem (form mutation → redirect or
   re-render) — see `node_modules/next/dist/docs/01-app/02-guides/
   server-actions.md`, consulted before writing any of this phase's code
   per this repo's own `AGENTS.md`. Its security section is followed
   directly: every action re-derives the session itself
   (`await auth()`), authorizes independently, and every underlying
   service function *also* calls `requireAdmin()` as its own first line —
   two independent checks, not one shared assumption, matching the doc's
   explicit "render-time gating is not a security boundary."

The public product's existing API-route convention is untouched — this
is additive, scoped entirely to `/admin`, not a retroactive migration.

## Admin CMS shape: one service function per mutation, one thin action wrapper

`src/features/<domain>/admin-service.ts` (new, alongside each domain's
existing public-read `service.ts`) holds every admin mutation as a plain
async function taking `(session, ...)` as its first argument(s):
`requireAdmin(session)` first line (throws `UnauthorizedError` otherwise —
the same assertion function Phase 1's `verifyFestivalOccurrence`
established, now reused everywhere rather than being its only call site),
then the actual `db` write, then an `audit.record(...)` call. The
`"use server"` action in `src/app/admin/<entity>/actions.ts` is
deliberately thin: re-derive the session, `zod`-validate the input
(`src/lib/validation/admin.ts`), call the service function, `catch` and
translate any thrown error into `{ok: false, error: string}` (never a raw
stack trace — spec §45), `revalidatePath(...)` on success. Every list page
is a server component reading `searchParams` for
search/filter/pagination (never client-side filtering over an
unbounded fetch — spec §38/§49); every detail/edit page is a server
component that fetches once and hands typed initial data to a client
form component.

## One `RelationPicker`, not a raw ID field, anywhere a relationship exists

Spec §12/§40 explicitly forbids asking an admin to type an id — every
festival↔destination/experience/food connection, every tag assignment,
and every single-select location/category picker goes through one
component, `src/components/admin/RelationPicker.tsx`: a debounced
typeahead (mirrors `HeaderSearch.tsx`'s exact debounce-and-fetch shape —
every `setState` call lives inside the fetch's own `.then()`, never
synchronously in the effect body, which is what keeps a stale in-flight
request from clobbering a newer one's result) against one shared
endpoint, `GET /api/admin/search?type=...&q=...` — admin-gated,
deliberately searching *all* content regardless of publish status (an
admin connecting two drafts together is normal; every public search path
in the app still filters to `PUBLISHED` only). Selected items render as
removable chips (`[Hornbill Festival ×]`), matching the spec's own sketch
exactly.

## Experience/Food gained a publish/archive lifecycle they never had

`Experience` and `Food` had no `status` field before this phase — every
row in the database was implicitly "live" the instant it existed, and no
public query ever filtered them by anything resembling draft/published.
Adding `status ContentStatus @default(DRAFT)` (see `docs/database.md` for
the migration/backfill details) meant finding and fixing *every* public
read path that returns Experience/Food data, not just adding the column:
`getFestivalBySlug`/`getDestinationBySlug`'s nested `experiences`/`foods`
relation includes, `getFestivalBySlug`'s `destinations` include (found to
be missing its own `status: "PUBLISHED"` filter in the same pass — a
pre-existing asymmetry with `getDestinationBySlug`'s `festivals` include,
which already had one — fixed here since it's the same bug class this
phase is explicitly closing), the map viewport query, the universal
search service (both its primary and typo-tolerant fallback queries), and
the map's single-item preview route. Verified directly: a draft
Experience/Food item created via the admin form does not appear on any
public page that would otherwise list it, confirmed via a raw
(unauthenticated) fetch of the relevant public route rather than trusting
UI-level absence alone.

## Media stays URL-reference-only — there is no binary upload path in this environment

`src/lib/media/storage.ts` (Phase 1) already defines the adapter shape for
real object storage (S3-compatible: endpoint/region/bucket/CDN base URL,
all read from `MEDIA_STORAGE_*` env vars) — but `getUploadUrl()` and
`deleteObject()` deliberately `throw` rather than fake-implement, since no
storage credentials exist in this environment and shipping a
signed-URL flow that can't actually be exercised or tested would be worse
than being explicit about the gap. The admin Media CMS therefore accepts
a pasted image URL directly — the exact same shape seed data already
uses (`Media.url` pointing at `picsum.photos`) — rather than building
upload UI around an adapter that cannot complete a real upload. Wiring a
real provider is a configuration change (set the env vars, implement the
two adapter methods against the chosen provider's SDK, add its host to
`next.config.ts`'s `images.remotePatterns`) rather than an admin-UI
change, by design.

## Audit log: a parallel system to analytics, not an extension of it

`AuditLog` (schema, `docs/database.md`) and `src/lib/audit/index.ts`
mirror `src/lib/analytics`'s exact three-layer shape (input interface,
`db`-backed recorder, one call per mutation site) deliberately — the
*pattern* is reused, the *table* is not. Spec §47 is explicit that admin
actions are "operational rather than product analytics" and should not
flow through the same pipe; `AuditEntityType` also has to cover strictly
more ground than `AnalyticsEventType`'s `ContentType` (Location, Media,
both category tables, Tag — none of which are analytics subjects). A
failed audit write never blocks or rolls back the admin's actual mutation
(`audit.record()` swallows its own errors, same as `analytics.track()`)
— operational logging should never be why a real edit fails to save.

## Best-time "system suggestion vs. admin decision": reused an existing field rather than adding parallel storage

Spec §15 asks to "preserve the distinction between system suggestion and
admin decision" when an admin overrides a destination's best-time
recommendation. `Destination.bestTimeSource: VerificationStatus`
(`UNVERIFIED | AI_GENERATED | ADMIN_VERIFIED | ADMIN_OVERRIDDEN`) already
existed and already encodes exactly this distinction as *provenance* of
whatever value currently sits in `bestTimeStartMonth`/`bestTimeEndMonth` —
`UNVERIFIED`/`AI_GENERATED` reads as "system suggestion," `ADMIN_VERIFIED`/
`ADMIN_OVERRIDDEN` reads as "admin decision." Rather than adding a second,
parallel set of columns to store "the original system suggestion"
alongside the current value (real schema growth for a case spec §36
explicitly discourages building "a full Git-like versioning system" for),
`adminUpdateDestination` auto-sets `bestTimeSource: "ADMIN_OVERRIDDEN"`
whenever the months actually change, and records the *prior* value
(months + source) in the audit log's `metadata.before` — enough history
to answer "what did the system say before an admin changed it," without
duplicate live storage. Verified: overriding a destination's best-time
months flips its badge to "Admin-overridden" and the audit log shows the
prior months/source in that entry's metadata.

## Phase 11: Analytics, Content Intelligence & Product Observability

Full event catalog, naming convention, anonymous-identity design, and
duplicate-prevention strategy now live in their own document —
[`docs/analytics.md`](./analytics.md) — rather than growing this file
further; it's the single source of truth a future phase should read (and
extend) before adding a new event. The short version of what changed
architecturally:

- **Three separate concerns, three separate tables**, deliberately not
  merged: `AnalyticsEvent` (product behavior, pre-existing), `SearchQueryLog`
  + `ContentOpportunityDismissal` (content intelligence, new), `ErrorLog` +
  `PerformanceLog` (technical observability, new). Spec §2's "do not mix
  these concepts together" is enforced at the schema level, not just by
  convention.
- **No new external dependency.** No charting library, no error-tracking
  SDK, no APM client — `package.json` had none of these before this phase
  and still doesn't. Charts are hand-rolled inline SVG (the `dataviz`
  skill's method, see `ActivityLineChart`'s docstring for why its series
  colors deliberately aren't the app's own brand palette); error/
  performance capture are the same lightweight adapter pattern
  `src/lib/analytics`/`src/lib/audit` already established, applied to two
  more concerns rather than reached for a vendor.
- **`/admin/analytics` reuses Phase 10's authorization stack wholesale** —
  same `requireAdmin()`, same three-layer defense-in-depth, no new
  authorization code written for this phase.

See `docs/analytics.md` for events, `docs/database.md` for the schema, and
the Phase 11 section of `docs/report.md` for what was tested.
