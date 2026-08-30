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

## Phase 2 — Design System & Application Shell

**Status: complete.**

### Summary

Built out the full design-system component library and application shell
on top of Phase 1's foundation (tokens, Button/Input/Badge/Card/Skeleton/
Modal/ResponsivePanel/Header/Footer already existed) — no map, no festival/
destination UI beyond what already existed, no CMS, per the phase's scope.

### Design-system components added

- **Typography**: a real scale (`text-display`/`h1`/`h2`/`h3`/`body`/
  `caption`/`label`) as Tailwind theme tokens, applied consistently across
  every page's headings (replacing ad hoc `text-3xl`/`text-4xl`).
- **Color**: added `warning`/`info` semantic tokens alongside the existing
  `success`/`danger`; kept the palette restrained (7 accent/semantic colors
  total).
- **Motion**: `duration-fast`/`duration-base`, `ease-standard`, and three
  keyframe-based animation utilities (`animate-fade-in`/`slide-up`/
  `scale-in`), plus a global `prefers-reduced-motion` override — one rule
  instead of threading a check through every animated component.
- **Buttons**: added `destructive` and `text` variants, an `icon` size, and
  a `loading` state (spinner + auto-disable).
- **Cards**: `variant` prop (`discovery`/`feature`/`compact`/
  `recommendation`/`mapPreview`).
- **New primitives**: `Pill` (interactive filter chip, distinct from the
  static `Badge`), `Tabs`, `Dropdown` (hand-rolled, no menu library),
  `Tooltip`, `ResponsiveImage` (aspect-ratio box + skeleton + error
  fallback, wraps `next/image`), `EmptyState`, `ErrorState`, `SkeletonCard`,
  `SearchInput`/`SearchOverlay`/`SearchResultGroup` (search UI foundation —
  no search engine wiring beyond what Phase 1 already built).

### Navigation & shell

- **Header**: rewritten as a scroll-aware client component (`transparentUntilScroll`
  prop, unused by any page yet but ready for a future hero page), with a
  minimal top-level nav (Explore▾, Map, Trips) per the phase's "keep it
  minimal" guidance — Festivals/Destinations/Hidden India/Calendar moved
  into the Explore dropdown instead of sitting as separate top-level links.
- **ExploreMenu**: dropdown (desktop) / bottom-sheet (mobile) content,
  sourced from one `exploreNav` config array — Food/Experiences/Seasonal
  Travel shown as "Soon" since they're not routes yet, per "design it so
  additional categories can be added later."
- **MobileNav**: fixed bottom nav (Home/Map/Trips/Profile + Explore, which
  opens the discovery bottom sheet rather than navigating directly, per the
  spec). Root layout adds `pb-16 md:pb-0` so content never sits under it.
- **AccountMenu**: session-aware — "Sign in" link when signed out, avatar
  dropdown (Profile/Trips/Admin-if-admin/Sign out) when signed in.
- **HeaderSearch**: opens the `SearchOverlay` foundation; submitting routes
  to the real `/search` page (which already executes a real query from
  Phase 1) — the overlay itself doesn't run queries.
- **Footer**: expanded to Explore/Plan/About sections.
- **Container primitives**: added `WideSection`, `FullBleed`,
  `FullScreenSection` alongside the existing `Container`.
- **Map-ready shell**: `MapShell` (controls row + canvas area +
  `ResponsivePanel`), `MonthSelector`, `LayerControls` — presentational
  only, wired into a real (interactive, stateful) `/map` page with a
  skeleton canvas placeholder. Current month is correctly pre-selected.
- **Route loading/error boundaries**: global `loading.tsx`/`error.tsx`/
  `not-found.tsx`, plus `loading.tsx` skeleton grids for `/festivals` and
  `/destinations` (the two routes that actually fetch data today).

### Design decisions

- Typography/color/radius/shadow/motion tokens all live in `globals.css`'s
  `@theme inline` block so they generate canonical Tailwind utilities
  (`text-h1`, `bg-marigold-500`, `duration-fast`, ...) — no arbitrary
  `var(--...)` syntax in component code (fixed several instances of this
  from Phase 1 during this phase).
- No dropdown/tooltip/menu library — hand-rolled with `useState` + a
  pointerdown/Escape listener, per the "avoid unnecessary dependencies"
  performance guidance. `Modal`/`SearchOverlay` use the native `<dialog>`
  element for the same reason (free focus trap + ESC handling).
- Dark mode: not implemented, per explicit instruction not to unless
  already present.

### Files changed

Renamed `src/middleware.ts` → `src/proxy.ts` (Next.js 16 deprecated the
`middleware` convention during this phase — same code, new filename).
~30 new component/route files under `src/components/ui`,
`src/components/layout`, `src/components/map`, `src/app`; `globals.css`
and `layout.tsx` updated; `next.config.ts` gained an `images.remotePatterns`
entry for the seed data's placeholder image host.

### Checks performed

- `npm run typecheck`, `npm run lint`, `npm run build` — all clean.
- Visual verification via a headless-Chromium script (Playwright) against
  both the dev server and a production build (`next build && next start`):
  screenshotted `/`, `/festivals`, `/festivals/hornbill-festival`, `/map`,
  `/search?q=fest` at 1440×900 and 390×844, plus the Explore dropdown
  (desktop) and Explore bottom sheet (mobile) open. Zero browser console
  errors on any page. (First pass against the dev server showed the
  Explore bottom-sheet tap hitting Next's dev-mode indicator badge, which
  overlaps that screen corner in dev only — confirmed non-issue against
  the production build.)

### Known gaps / follow-ups

- `HeaderSearch`'s overlay and the `/search` page still run two separate
  code paths for the same query (the overlay doesn't show live
  suggestions) — acceptable per "do not build the complete search engine
  yet," but worth unifying once search grows a suggestions API.
- `ResponsiveImage` isn't used anywhere yet (no page renders content images
  yet beyond what `next/image` would need); it'll get its first real
  exercise once festival/destination cards grow hero images.
- No automated component tests — same gap noted in the Phase 1 report,
  still no test runner configured.

---

## Phase 3 — The Living India Map

**Status: complete.**

### Summary

Built the first fully functional version of the interactive India map,
replacing Phase 2's static shell with a real MapLibre GL canvas: India/state
boundaries, clustered discovery markers (festivals/destinations/experiences/
events), month + "All Year" filtering, five toggleable layers, map-specific
search with fly-to, click-through state and discovery preview panels,
Save/Add-to-Trip integration points, and URL-based map-state preservation.

### 1. Map technology

**MapLibre GL JS 6**, as selected in Phase 1. Basemap style:
[OpenFreeMap](https://openfreemap.org)'s `positron` style — free, keyless,
unlimited use, no billing/API-key setup required for local dev or
production. Chosen over Mapbox/MapTiler specifically to avoid requiring the
user to provision a paid account before the map works at all.

### 2. Geographic data source/format

India state/UT boundaries: Natural Earth's `ne_50m_admin_1_states_provinces`
(admin-1 scale), filtered to India (36 features), renamed to modern
names/slugs, and lightly simplified with `mapshaper` — 13.6MB → 17KB. Public
domain, safe for commercial redistribution. Deliberately **not** the
GADM-derived datasets most commonly linked as "India states GeoJSON" on
GitHub — GADM's license prohibits commercial redistribution without
permission, which doesn't fit a production app. Full provenance in
`public/geo/SOURCE.md`.

### 3. Viewport loading

`GET /api/map/viewport` (bbox + optional month) is the only network call
driven by panning/zooming, debounced 300ms after `moveend`. It returns a
normalized, lightweight `MapDiscovery[]` (id/kind/name/coordinates/slug/
popularity — no descriptions or images) regardless of source table
(festivals, destinations, experiences, or events via their location).
`src/features/map/service.ts` is the single call site; nothing outside it
queries these tables for map purposes.

### 4. Clustering

MapLibre's native `cluster: true` GeoJSON source support — no
`supercluster` or other clustering library. Cluster counts come directly
from MapLibre's own aggregation of whatever's currently in the source, so
they're always accurate by construction (never hand-computed/faked).
Clicking a cluster calls `getClusterExpansionZoom()` and eases the camera in.

### 5. Month filtering

Festivals are matched against `FestivalOccurrence.startDate` for the
selected month (current month selected by default); destinations/
experiences/events aren't time-bound in the current schema so they're
unaffected by the month filter. Switching months or toggling a layer
re-filters the **already-fetched** discovery list client-side
(`toFeatureCollection()` in `MapCanvas.tsx`) and calls `source.setData()` —
no network request, and MapLibre's clustering re-runs correctly on the
filtered point set since it operates on whatever's in the source at that
moment.

### 6. Layers

Five toggles (Festivals/Destinations/Hidden Gems/Experiences/Food-Events),
independent, not mutually exclusive — a hidden festival matches both
"Festivals" and "Hidden Gems" simultaneously and renders once (dedup is
inherent to filtering one array, not two). "Hidden Gems" needed a schema
change: `Destination` didn't have a popularity/hidden classification
(only `Festival` did). Added `ContentPopularity` (renamed from
`FestivalPopularity`) to `Destination` — see `docs/database.md`.

### 7. Map state preservation

Center/zoom/month are written to the URL (`?lat=&lng=&zoom=&month=`) via
plain `history.replaceState`, not `next/navigation`'s router (which would
re-run an RSC fetch on every pan/zoom — UI-state bookkeeping shouldn't
trigger that). Reading it back out on load required a real fix — see bug
#2 below.

### 8. Desktop/mobile interaction model

Reuses Phase 2's `ResponsivePanel` unmodified: side panel on desktop,
bottom sheet on mobile, for both the discovery preview panel and the state
summary panel. `MapShell` (controls row + canvas + panel) is the same
component added in Phase 2, now driven by real data instead of a skeleton
placeholder.

### 9. Save / Add to Trip / Explore

- **Save**: `src/components/map/useSavedState.ts` — guests persist to
  `localStorage` via the existing guest store (Phase 1), signed-in users
  via `POST/GET /api/saved` (new). One hook, reusable by future
  festival/destination detail-page Save buttons.
- **Add to Trip**: an honest temporary interaction state (local component
  state in `DiscoveryPreviewPanel`, resets on panel close) — the real trip
  builder is out of scope for this phase per the spec; this is the
  documented integration point for it.
- **Explore**: real navigation to `/festivals/[slug]` or
  `/destinations/[slug]` (both already exist from Phase 1) — not a
  placeholder, since those pages are real.

### Files created/modified

New: `src/components/map/{MapCanvas,MapSearch,DiscoveryPreviewPanel,
StatePanel,useSavedState}.tsx`, `src/app/api/map/{viewport,search,
discovery,state/[slug]}/route.ts`, `src/app/api/saved/route.ts`,
`src/app/api/analytics/track/route.ts`, `src/features/locations/service.ts`,
`public/geo/india-states.geojson` (+ `SOURCE.md`), `public/maplibre/*`
(worker fix, + `README.md`). Modified: `src/features/map/{types,
service}.ts` (rewritten), `src/features/festivals/*`,
`src/features/destinations/*` (added `stateSlug` filtering, `precision`,
`popularity` on destinations), `src/app/map/MapPageClient.tsx` (rewritten),
`prisma/schema.prisma` + 2 new migrations, `prisma/seed.ts` (destination
popularity values), `eslint.config.mjs` (exclude vendored worker files).

### Tests/checks performed

- `npm run typecheck`, `npm run lint`, `npm run build` — all clean.
- Real end-to-end verification via headless Chromium against the
  **production build** (`next build && next start`, not just `next dev`):
  map load, cluster click → zoom, marker click → discovery preview panel
  (fetches real seed data, Save/Add to Trip/Explore all functional),
  state-boundary click → state panel with real counts, map search →
  fly-to, layer toggle, month switch, and — critically — **reload the page
  and confirm center/zoom/month are restored exactly**, with zero browser
  console errors throughout.

### Two confirmed bugs found and fixed during this phase

Both were invisible to `tsc`/`eslint`/`next build` and only surfaced by
actually driving the built app in a browser:

1. **Turbopack silently breaks MapLibre's Web Worker.** The map rendered
   nothing at all — no error, no thrown exception, `load`/`idle` events
   never fired, zero tile requests. Root cause: Next.js 16's default
   bundler doesn't resolve maplibre-gl's internal tile-parsing worker
   module correctly. Fixed by serving the worker (and its sibling chunk)
   as static files from `public/maplibre/` and calling `setWorkerUrl()`
   before constructing any `Map`. Documented in `public/maplibre/README.md`
   with re-copy instructions for future `maplibre-gl` version bumps.
2. **MapLibre's own stylesheet silently wins a CSS specificity fight.**
   `maplibre-gl.css` sets `.maplibregl-map { position: relative }`, which
   at equal specificity overrides a Tailwind `absolute` class applied to
   the same element (whichever stylesheet loads later in the cascade
   wins) — `inset-0` then does nothing (it only affects
   absolute/fixed-positioned elements), and the map container collapses to
   zero height. Fixed by sizing with `h-full w-full` against the
   already-sized flex parent instead.
3. (Not bundler/CSS — a genuine app bug, also fixed) **Hydration mismatch
   on `month`.** Seeding `month` state from `readUrlState()` synchronously
   during the initial render meant the server's render (no `window`, so
   `month` defaults to the current month) and the client's first render
   (real URL, e.g. `month=12`) disagreed — a classic Next.js hydration
   mismatch. The `MonthSelector` UI would silently stick on the server's
   default value after a reload despite React state and the URL both
   correctly holding the right month. Fixed with the standard pattern:
   `month` always starts at the server-safe default and is corrected once,
   client-side, in a `useEffect` after mount.
4. (Also fixed while auditing the above) **Stale closures in
   `MapCanvas`'s mount-once event handlers** — `onViewportChange`/
   `onDiscoverySelect`/`onStateSelect`/`onZoom` were captured once at
   mount and would silently go stale if the parent passed new closures on
   re-render (e.g. `onViewportChange`, memoized on `[month]`, could still
   fire with a stale `month` after the user changed months and then
   panned). Fixed with the standard ref-mirror pattern: refs kept current
   every render, dereferenced inside the mount-once handlers instead of
   closing over the props directly.

### Performance considerations

- Viewport queries are capped (`take: 500` per content type) and scoped to
  the bbox — never all-of-India in one response.
- Layer/month changes never hit the network — only bbox changes do,
  debounced.
- The India boundary file is 17KB; fetched once, cached by the browser for
  the session.
- Not yet load-tested against "thousands of festivals/destinations" per
  the spec's stated design target — current seed data is small (7
  festivals, 5 destinations). The architecture (bbox-scoped queries,
  native clustering, capped per-type limits) should hold, but this is
  unverified at scale.

### Known gaps / follow-ups

- Experiences/events aren't month-filtered (schema has no time dimension
  for them) — only festivals respond to the month selector.
- `Food` items have no coordinates in the schema (only a region name +
  optional city `Location`), so standalone food content never appears on
  the map — only `Event` records (which do have a location) populate the
  "Food / Events" layer. Noted as a schema gap, not fixed this phase.
- "Add to Trip" is intentionally not persisted (see above) — resets on
  panel close/reload. The real trip builder is a later phase.
- No automated tests — consistent with the gap noted in Phases 1–2.

---

## Phase 4 — Festival Discovery System

**Status: complete.**

### Summary

Built the complete festival discovery experience on top of the existing
data model: a real `/festivals` listing page (Happening Now / Upcoming /
Browse-by-Month sections, driven by a ranking service) and a rich
`/festivals/[slug]` detail page (hero, countdown, gallery, progressive
disclosure sections, nearby discovery, Save/Visited/Add-to-Trip/Share,
structured data). No destination system, recommendation engine, calendar,
trip builder, or CMS work — all explicitly out of scope for this phase.

### 1. Festival data model

No changes to the core Festival/FestivalOccurrence shape from Phase 1 — it
already had everything this phase needed (category, popularity, occurrences
with `dateConfidence`). Three additions, each directly required by an
explicit spec line rather than spec-cover reflex:

- **`Festival.featured: Boolean`** — the spec names "editorial featuring"
  as a ranking signal in three separate places (Phase 3 map relevance,
  Phase 4/5 discovery ranking); there was no field for it.
- **`Destination.popularity`** (carried over from Phase 3's Hidden Gems
  layer work) — reused here for the destinations shown in "Nearby".
- **`Location.{nearestAirport,nearestRailwayStation,roadAccessNotes,
  localTransportNotes,accommodationNotes}`** — "How to Reach"/"Where to
  Stay" had literally no backing fields before this phase. Kept at
  city/region `Location` level, not duplicated per festival, since
  everything in the same city shares the same airport/station/hotels.

All three via hand-written additive migrations (see the Phase 3 report for
why `migrate dev` isn't used in this environment — same reasoning applies).

### 2. Festival ranking approach

`src/features/festivals/ranking.ts` — a transparent weighted-sum heuristic,
not a learned model: featured (+100) > happening-now (+60) > upcoming
within 30/90/90+ days (+40/+20/+5) > selected-month match (+30) >
popularity, with `LOCAL_EMERGING`/`HIDDEN` scoring the same as `POPULAR`
(8+10 diversity boost vs. 15 flat) per the spec's explicit "do not use
popularity as the only ranking signal." `getFestivalDiscoveryFeed()` in
`src/features/festivals/service.ts` annotates every published festival with
its most relevant occurrence + computed status, then ranks once; the
listing page filters that single ranked list into its three sections
instead of issuing three separate queries.

### 3. Festival page architecture

`/festivals/[slug]` is a server component that fetches everything up front
(`getFestivalBySlug` — now includes foods/experiences/destinations/events/
location-with-parent; `getFestivalMedia`; `getNearbyToFestival`) and renders
mostly static HTML, with small client islands only where interactivity is
unavoidable: `Countdown` (must reflect the viewer's actual current time,
not build/request time — see below), the gallery lightbox, and the
Save/Visited/Add-to-Trip/Share buttons (extracted to `src/components/
discovery` — see #8).

### 4. Date/status implementation

`src/features/festivals/status.ts` — `resolveFestivalStatus()` derives
Happening Now / Upcoming / Past / Expected / Not Announced from one
occurrence row; `daysUntil()` backs the countdown. `Countdown.tsx` is a
client component specifically because the day count must reflect the
browser's clock at *view* time — computing it server-side risked baking a
stale count into a statically-optimized render.

### 5. Map integration

"View on Map" links to `/map?lat=&lng=&zoom=11&month=` using the
festival's coordinates and next-occurrence month — reusing Phase 3's URL
state format directly, no new map code needed. Finding and fixing the bug
below was necessary to make this link actually work.

### 6. Nearby discovery implementation

Two sources, merged and deduplicated: the curated `Festival.destinations`
m2m relation (host-region connections — added to seed data this phase,
previously unpopulated) shown first, then geographic proximity via
`getNearbyToFestival()` (a ~150km bounding box around the festival's point,
reusing `padBoundingBox` from Phase 1's geo lib) for festivals/destinations
that aren't curated. "Related Experiences" and "Food" use the direct
`Festival.experiences`/`.foods` relations, not geo-proximity — the
Experience entity has no dedicated detail page yet, so those render as
text rather than dead links.

### 7. SEO implementation

`generateMetadata` (title/description/canonical/OG including a real social
image now — the previous version had no image), `Festival` + `BreadcrumbList`
JSON-LD (same `<` → `<` escaping pattern from Phase 1's festival page,
carried forward). `/festivals` itself also got real `PAGE_VIEW`/
`FESTIVAL_VIEW` analytics tracking, which existed as unused helper
functions in `src/features/analytics/service.ts` since Phase 1 but had
never actually been called from a page.

### 8. Save/Visited/Add-to-Trip integration

Extracted the map's Phase 3 Save/Add-to-Trip buttons into
`src/components/discovery` (`SaveButton`, `AddToTripButton`, plus new
`VisitedButton`, `ShareButton`) so the festival page and the map's
discovery panel share one implementation instead of two. Added "Visited" as
a real toggle (`toggleVisitedContent`/`isContentVisited` in
`src/features/users/service.ts`, `/api/visited` route) — the Phase 1
version was upsert-only and couldn't un-mark. Visited is authenticated-only
by design: the Phase 1 guest-persistence architecture only ever covered
save + trips, not visited state, so a signed-out user is prompted to sign
in rather than getting a silently-local visited flag with no account-merge
path.

### Files created/modified

New: `src/components/festivals/*` (Card, StatusBadge, Countdown, Gallery,
NearbyDiscovery, MonthFilter, FilterPills), `src/components/discovery/*`
(contentKind, useSavedState — moved from `components/map`, useVisitedState,
SaveButton, VisitedButton, AddToTripButton, ShareButton),
`src/components/ui/Disclosure.tsx`, `src/features/festivals/{status,
ranking}.ts`, `src/features/locations/service.ts` (shared state→location-ids
resolver, also backported into `features/festivals`+`features/destinations`
list filters for real `?state=` support), `src/app/api/visited/route.ts`.
Modified: `src/features/festivals/{service,types}.ts` (discovery feed,
nearby, media wiring), `src/app/festivals/page.tsx` and `[slug]/page.tsx`
(rewritten), `src/app/destinations/page.tsx` (hidden-gem badge, `?state=`),
`prisma/schema.prisma` + 2 migrations, `prisma/seed.ts` (transport/
accommodation data, `featured` flags, festival↔destination connections).

### A real bug found and fixed this phase (client-side navigation into `/map`)

Not caught by `tsc`/`eslint`/`next build` — only surfaced by actually
clicking "View on Map" in a browser against the production build (the same
discipline that caught Phase 3's three bugs). `MapPageClient` read its
initial `?lat&lng&month` state via `window.location.search` inside a
`useState` lazy initializer. That's reliable on a hard navigation/reload
(confirmed working in Phase 3 testing) but **not** on a Next.js
client-side navigation: instrumented logging showed `location.search` was
still empty at the exact moment the new page's component first rendered —
Next mounts the target route's components essentially concurrently with,
not strictly after, updating `window.location`. The month selector (and
the map's initial camera position) would silently fall back to defaults,
so a "View on Map" link from a December festival opened the map showing
the current month instead. Fixed by reading state via `next/navigation`'s
`useSearchParams()` instead, which is kept in sync with the router rather
than the raw browser API (`/map/page.tsx` now wraps `MapPageClient` in
`<Suspense>`, which the hook requires). Verified both directions
afterward: client-side nav now correctly restores December, and the
original reload-restoration path (Phase 3's fix) still works unmodified.

### Tests/checks performed

- `npm run typecheck`, `npm run lint`, `npm run build` — all clean.
- Real end-to-end verification via headless Chromium against the
  **production build**: festival listing (desktop/mobile, month/category/
  classification filters, images loading via the Next.js image optimizer),
  festival detail (desktop/mobile, disclosure expansion, Save → guest
  localStorage toggling to "Saved", Add to Trip → "Added", 404 for an
  unknown slug), and the View on Map deep link end-to-end including the
  bug above and its fix.

### Known gaps / follow-ups

- "Add to Trip" is still the Phase 3 temporary interaction state (resets
  on reload) — unchanged, still correctly out of scope per the spec.
- No "What to Expect" section — the spec explicitly warns "do not
  fabricate details," and there's no real backing content for it yet;
  omitted rather than invented, matching "only show sections with
  meaningful content."
- Experience/Food entities still have no dedicated detail pages, so
  "Related Experiences"/"Food" render as text, not links — consistent with
  "use the correct route structure and a clean placeholder" where no page
  exists at all yet, rather than fabricating one.
- No automated tests — same gap noted in Phases 1–3.

---

## Phase 5 — Destination Discovery System

**Status: complete.**

### Summary

Built the complete destination discovery experience, mirroring Phase 4's
festival system in shape: a real `/destinations` listing page (Featured /
Best This Month / Hidden Gems / More Destinations sections, ranked by a
seasonal-aware heuristic) and a rich `/destinations/[slug]` detail page
(hero, quick travel snapshot, progressive disclosure, nearby discovery,
Save/Visited/Add-to-Trip/Share, structured data), plus a real
`/hidden-india` editorial page. Along the way, generalized the Phase 4
festival-only UI pieces (gallery, filter links, nearby discovery) into
shared components now used by both content types — the second consumer is
what triggered the generalization, not a preemptive abstraction.

### 1. Destination data architecture

Two additions, both mirroring Phase 4's festival pattern for the same
reasons: `DestinationCategory` (a real DB-backed taxonomy — Nature,
Heritage, Beach, Mountain, Cultural, City — since `Destination` had *no*
type field at all before this phase, unlike `Festival`) and
`Destination.featured: Boolean`. `DestinationCategory` deliberately omits
"Hidden gem"/"Major destination" from the spec's example type list — those
describe popularity, not type, and `Destination.popularity` already covers
that; adding them as categories too would be a redundant second
classification for the same concept. Full rationale in `docs/database.md`.

### 2. Seasonal ranking implementation

`src/features/destinations/ranking.ts` — same weighted-sum shape and
balance as the festival ranker (featured +100, popularity scored so
`HIDDEN`/`LOCAL_EMERGING` aren't drowned out by `POPULAR`), with
"seasonal suitability" (+40, current/selected month inside
`bestTimeStartMonth`–`bestTimeEndMonth`, wraparound-aware) replacing
festivals' temporal-status scoring, and "festivals/events nearby" as a
cheap proxy: +15 if the destination has any curated `Festival` connection.
Extracted the month-in-range-with-wraparound check
(`src/lib/date/month-range.ts`) out of `lib/recommendations/scoring.ts`,
which had a private, unexported copy of the identical logic — now shared
by both.

### 3. Best-time implementation

No schema changes — Phase 1's `bestTimeStartMonth`/`EndMonth`/`altTime*`/
`bestTimeExplanation`/`bestTimeSource` already covered everything this
phase needed. `formatMonthRange()` and `isInSeason()`
(`src/features/destinations/seasonal.ts`) are the only new code: display
formatting and the seasonal-indicator check shared by cards, the listing
page's "Best This Month" section, and the detail page's quick snapshot.

### 4. Budget implementation

`BudgetBadge` renders `BudgetLevel` as ₹/₹₹/₹₹₹. "Typical trip" cost (the
spec's own example: "₹12K–₹18K") is a documented heuristic —
`approximateCostPerDay × [3, 5]` days — not a real estimator; the honest
per-traveller/per-duration estimate is explicitly recommendation-engine
territory (out of scope). Landed close to the spec's own illustrative
number by coincidence, not by tuning to match it.

### 5. Festival/destination relationships

The `Festival.destinations` m2m relation existed in the schema since Phase
1 but was never actually populated in seed data until Phase 4 (3
connections) and this phase (a 4th, for the new Palolem Beach → Goa Food &
Music Festival pairing — added specifically because "Beach" had zero
category coverage otherwise). The destination detail page's "Festivals"
section reads this relation directly; nothing new needed there.

### 6. Nearby discovery implementation

`getNearbyToDestination()` — same ~150km bounding-box pattern as Phase 4's
`getNearbyToFestival()`, reusing `padBoundingBox`. Renders through the
now-shared `NearbyDiscovery` component.

### 7. Hidden India implementation

`/hidden-india` queries `getFestivalDiscoveryFeed({ popularity: "HIDDEN" })`
and `getDestinationDiscoveryFeed({ popularity: "HIDDEN" })` and renders
both in one page, under a deliberately moodier full-bleed dark band (`bg-ink
text-paper`) — still built from the shared design tokens, not a second
theme, per the spec's "part of the shared design system." Also fixed a
real bug here (see below).

### 8. Map integration

"View on Map" reuses the exact `/map?lat&lng&zoom&month` URL contract from
Phase 3/4 — no new map code, no new bugs (the Phase 4 `useSearchParams()`
fix already covers this path).

### 9. SEO implementation

Same shape as Phase 4's festival page: `generateMetadata` with a real OG
image, `TouristAttraction` + `BreadcrumbList` JSON-LD with the same
`<` → `<` escaping. `/destinations` and `/destinations/[slug]` were
already dynamic (searchParams / slug params force it); `/hidden-india`
needed an explicit fix — see below.

### 10. Analytics implementation

`trackPageView`/`trackDestinationView` (both existed since Phase 1, unused
until now) wired into `/destinations` and `/destinations/[slug]`;
`trackPageView` also added to `/hidden-india`. Click-level analytics
(destination/nearby/festival/experience/food clicked) remain out of scope
for the same reason as Phase 4's festival cards — no client JS on a
server-rendered card grid; the honest scope trim, not an oversight.

### Files created/modified

New: `src/components/destinations/{DestinationCard,BudgetBadge}.tsx`,
`src/features/destinations/{ranking,seasonal}.ts`,
`src/lib/date/month-range.ts`, `src/app/hidden-india/page.tsx` (real
implementation), `src/app/destinations/[slug]/loading.tsx`. Moved:
`FestivalGallery` → `src/components/ui/Gallery.tsx`, `NearbyDiscovery` →
`src/components/discovery/`, `FestivalMonthFilter`/`FestivalFilterPills` →
`src/components/ui/{MonthFilterLinks,FilterPillLinks}.tsx` (generalized
with a `basePath` prop). Modified: `src/features/destinations/{service,
types}.ts` (discovery feed, nearby, media wiring), `src/app/destinations/
page.tsx` and `[slug]/page.tsx` (rewritten), `src/app/festivals/*` (updated
imports for the moved components), `src/app/sitemap.ts` (added
`revalidate`), `src/lib/recommendations/scoring.ts` (now imports the
shared month-range helper), `prisma/schema.prisma` + 1 migration,
`prisma/seed.ts` (destination categories/featured flags, a new Palolem
Beach destination, plus a real idempotency fix — see below).

### Two real bugs found and fixed this phase

1. **Seed script upserts weren't actually idempotent.** `db.festival.upsert`/
   `db.destination.upsert`'s `update` blocks only ever contained whichever
   field had most recently been added (e.g. just `featured`), never the
   full set. Re-running the seed against already-existing rows silently
   left `popularity` (and others) stuck at whatever they were on first
   insert, regardless of what the seed script's source data said. Caught
   by literally reading the query output after a reseed, not by any
   automated check — the destination popularity values didn't match what
   was in `prisma/seed.ts`. Fixed by making both `update` blocks
   comprehensive (every field the seed script owns), so re-running now
   actually converges the database to match the source, which is the
   entire point of an idempotent seed.
2. **`/hidden-india` was silently frozen at build time.** No
   `searchParams`/dynamic API on the page meant Next.js statically
   prerendered it — the DB query ran once, at `next build`, and every
   visitor got that same frozen HTML until the next deploy. Caught by
   reading the build's route table (`○` vs `ƒ`), the same discipline that
   caught Phase 3/4's runtime bugs, applied one step earlier in the
   pipeline. Fixed with `export const dynamic = "force-dynamic"`; applied
   the lighter-weight `export const revalidate = 3600` to `sitemap.ts`,
   which has the identical structural risk but doesn't need per-request
   freshness.

### Tests/checks performed

- `npm run typecheck`, `npm run lint`, `npm run build` — all clean; the
  build's route table was specifically re-checked after the dynamic-
  rendering fixes to confirm `/hidden-india` moved from `○` to `ƒ` and
  `/sitemap.xml` picked up `Revalidate 1h`.
- Real end-to-end verification via headless Chromium against the
  **production build**: destination listing (desktop/mobile, month/type/
  classification filters, section correctness), destination detail
  (desktop/mobile, disclosure sections including the curated festival
  connection, Save toggling, transport/accommodation conditional
  rendering, 404), and `/hidden-india` (both sections populated, correct
  seasonal indicators). Zero browser console errors throughout.

### Known limitations

- "Add to Trip" is still the Phase 3 temporary interaction state.
- Click-level analytics on card grids remain unwired (see #10 above) —
  consistent with Phase 4, not a new gap.
- "Typical trip" cost is a simple heuristic, not a real estimator (see #4).
- No automated tests — same gap noted in every prior phase.

---

## Phase 6 — Search, Calendar & Unified Seasonal Discovery

**Status: complete.**

### Summary

Built the discovery layer connecting Search, Calendar, Map, Festivals,
Destinations and Explore around "where + when + what": a real universal
search (categorized results, tiered relevance ranking, pg_trgm typo
tolerance, empty-state suggestions) wired into both the header overlay and
`/search`; a real `/calendar` (Happening Now / Upcoming / browse-by-month,
each month showing its festivals plus a seasonal destination rail); a real
`/explore` gateway page; and a bidirectional Calendar ↔ Map month link,
which required a genuine bug fix in the map's URL-state parsing, not just
new UI. "Discovery context" (month + geography) stayed the URL rather than
becoming a new client store — every page already treated it that way.

### 1. Search architecture

`src/features/search/service.ts`'s `search()` fetches a superset per
content type (name OR location-name OR tag OR description match — one `OR`
clause, using the trigram-indexed `name`/description columns from the
`search_and_geo_indexes` migration) across Festival, Destination,
Experience, Food, Location (state/city) and Event, then ranks and slices in
JS. Two new endpoints: `/api/search/suggest` (debounced live results for
the header overlay) and `/api/search/popular` (lazy empty-state fallback —
only fetched once a query has actually come up empty). `/search` calls the
service directly (already server-rendered); the overlay hits the same
`search()` logic through the API route, so ranking/tracking behavior is
identical from both entry points.

### 2. Search ranking implementation

A transparent weighted tier, not alphabetical or a black box: exact/prefix/
substring name match (100/80/55) ranks above a location-name match (40),
which ranks above any other OR-clause match — tag or description, folded
together rather than a second query just to attribute which field matched
— with a small popularity/editorial bonus (+10 featured, +3 `POPULAR`) on
top. Same "transparent weighted sum" shape as the festival/destination
ranking heuristics from Phase 4/5.

### 3. Search indexes used

The existing `pg_trgm` GIN trigram indexes on `name` (all content tables,
`search_and_geo_indexes` migration) now serve two purposes: `ILIKE`
substring matching (as before) and, new this phase, `similarity()`-ranked
typo-tolerant fallback (`fuzzyMatchIds()`) — fired per content type only
when the plain match returns zero rows, so a normal query never pays the
extra cost. Threshold 0.25, capped at 5 fuzzy candidates per type.

### 4. Calendar architecture

`/calendar` has two modes off one `?month=` param: no month selected shows
"Happening Now" + "Upcoming" (new `getHappeningNowFestivals()`/
`getUpcomingFestivals()` in `src/features/festivals/service.ts` — thin
filters over the existing `getFestivalDiscoveryFeed()`, not a second status
model); a month selected shows that month's festivals plus a "Best Places
to Visit in {Month}" rail from `getDestinationDiscoveryFeed({ month })`
(Phase 5's seasonal ranking, unmodified). Month navigation reuses
`MonthFilterLinks` (`basePath="/calendar"`) — no new month-picker component.

### 5. Month/discovery context implementation

`src/features/discovery/context.ts` — pure `calendarHref`/`mapHref`/
`festivalsHref`/`destinationsHref` functions building one page's URL out of
another's `{month, stateSlug}`. Not a store: every consuming page already
reads `?month=`/`?state=` from its own URL as the source of truth (Phase
3's map, Phase 4/5's listing pages), so the "shared context" is the URL —
this module is only the one place that assembles cross-page links out of
it, per the spec's "do not put every UI state into global state."

### 6. Happening Now logic

Unchanged from Phase 4/6 — `resolveFestivalStatus()` is still the one
status model. New: `getHappeningNowFestivals(limit)` in the festivals
service, a thin `.filter(status === "HAPPENING_NOW")` over the ranked
discovery feed, shared by Calendar and Explore instead of each page
re-deriving it.

### 7. Seasonal destination ranking

Unmodified — Phase 5's `rankDestinations()`/`getDestinationDiscoveryFeed({
month })` is reused as-is by both Calendar's per-month rail and Explore's
"Best Places to Visit This Month" section. No new ranking code was needed;
the phase's own instruction was to *connect* existing services, not build
new ones.

### 8. Map ↔ Calendar integration

Calendar → Map: a month page's "Explore {Month} on Map →" link goes to
`mapHref({ month })`, i.e. `/map?month=N` with no viewport. This exposed a
real bug: `MapPageClient.tsx`'s old `parseUrlState()` returned one object
and required `lat`+`lng`+`zoom` to all be present before it would read
`month` at all — a month-only URL silently fell back to the current month
instead. Fixed by splitting it into independent `parseViewState()` (still
requires all three viewport params) and `parseMonthParam()` (reads `month`
regardless, `undefined` when absent vs. `null` for "all year", so the
effect that applies it doesn't clobber the default). Map → Calendar: a new
"View {Month} Festivals →" link next to `MonthSelector`, to
`calendarHref({ month })` — needed no equivalent fix, since `/calendar`
already treated `?month=` as authoritative.

### 9. Explore page structure

`/explore`: dark editorial hero → Happening Now (festivals) → "{Month} in
India" (a handful of this-month festivals, distinct from the destination
rail below it) → "Best Places to Visit This Month" (destinations) → a
Hidden India band (2 hidden destinations + 2 hidden festivals, CTA to
`/hidden-india`) → three CTA tiles (Map/Festivals/Destinations). Every
section hides itself when empty, same pattern as every other discovery
page this codebase has built. `dynamic = "force-dynamic"` for the same
reason as `/hidden-india` (Phase 5): no `searchParams` of its own, so
without it Next would statically freeze a page that's supposed to be live.

### 10. Analytics implementation

Four new `AnalyticsEventType` values (`SEARCH_OPENED`,
`SEARCH_RESULT_CLICK`, `CALENDAR_INTERACTION`, `EXPLORE_INTERACTION`;
migration `20260830140000_search_calendar_explore_analytics`).
`CALENDAR_INTERACTION`/`EXPLORE_INTERACTION` are each one generic type
disambiguated by `metadata.action`, the same shape `MAP_INTERACTION`
already used — not a dedicated enum value per action. Two new small
primitives carry this: `TrackedLink` (a `next/link` + one `trackClientEvent`
call) and `TrackedCardWrapper` (the same, wrapping a card whose only
interactive surface is its own internal `Link`), written once Calendar
*and* Explore needed the identical pattern. "Search refinement" (spec's
own search-analytics list) is deliberately not a separate tracked event —
`AnalyticsEvent` has no session concept, so a second `SEARCH_QUERY` close
in time to a first is already a refinement in the data.

### 11. SEO changes

`/calendar` and `/explore` already had placeholder `metadata` blocks and
sitemap entries from Phase 1's scaffolding (`src/app/sitemap.ts`'s
`STATIC_ROUTES` already listed both) — only the copy needed to become real.
`/search` stays `robots: { index: false }` (query pages, not content).

### Files created/modified

New: `src/features/discovery/context.ts`, `src/lib/hooks/useDebouncedValue.ts`,
`src/components/discovery/{TrackedLink,TrackedCardWrapper}.tsx`,
`src/app/api/search/{suggest,popular}/route.ts`, `src/lib/validation/search.ts`,
`prisma/migrations/20260830140000_search_calendar_explore_analytics/`.
Rewritten: `src/app/calendar/page.tsx` and `src/app/explore/page.tsx` (real
implementations, replacing Phase 1 `PlaceholderPage`s), `src/features/search/
{service,types}.ts`, `src/app/search/page.tsx`, `src/components/layout/
HeaderSearch.tsx`. Modified: `src/app/map/MapPageClient.tsx` (the
`parseUrlState` split — see #8), `src/components/map/MapSearch.tsx`
(refactored onto `useDebouncedValue`), `src/features/festivals/service.ts`
(`getHappeningNowFestivals`/`getUpcomingFestivals`), `src/config/nav.ts`
(added an actual `/explore` link — the "Explore ▾" dropdown previously had
no link to `/explore` itself, only to the categories inside it),
`src/lib/validation/map.ts` (new event types in `analyticsEventSchema`),
`prisma/schema.prisma`, `docs/{architecture,database}.md`. New loading
states: `src/app/{search,calendar,explore}/loading.tsx`.

### One real bug found and fixed this phase

**Calendar → Map month deep link silently ignored the month.** Covered in
detail under #8 above — a month-only URL (`/map?month=10`, no viewport)
fell back to the current month instead of October, because the old
`parseUrlState()` gated reading `month` behind `lat`+`lng`+`zoom` all being
present. Caught while building the Calendar → Map CTA, not by an automated
check; verified fixed via a real headless-browser navigation from
`/calendar?month=10` through to `/map` with the October pill actually
selected.

### Tests/checks performed

- `npm run typecheck`, `npm run lint`, `npm run build` — all clean.
  `/calendar` renders dynamically (searchParams); `/explore` needed the
  explicit `force-dynamic` export (same reasoning as `/hidden-india`).
- Real end-to-end verification via headless Chromium against the
  **production build**: header search overlay (open → debounced categorized
  results → click-through; zero-result → suggestions), `/search` (real
  query, typo-tolerant query via pg_trgm fallback for two different
  misspellings, zero-result state, back-navigation preserving `?q=`),
  `/calendar` (default Happening-Now/Upcoming view, `?month=10` view, the
  "Explore October on Map" round trip landing on a correctly-selected
  October), `/map?month=10` as a cold deep link (confirms the parser fix
  directly), the reverse "View October Festivals" link back to
  `/calendar?month=10`, `/explore` (all sections, CTAs), the new `/explore`
  nav entry, and mobile viewports for Calendar/Explore. Zero browser
  console errors or failed requests across all of it.

### Known limitations

- Search's relevance tiers don't distinguish *which* non-name field
  matched (tag vs. description) — both fold into one "other match" tier,
  a deliberate simplification over running a second attribution query for
  marginal ranking value (see #2).
- No automated tests — same gap noted in every prior phase.

---

<!-- Phase 7+ reports appended below as each phase completes. -->
