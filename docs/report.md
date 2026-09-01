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

## Phase 7 — Personalization & Recommendation Engine

**Status: complete.**

### Summary

Built the first real recommendation engine: a transparent, deterministic,
weighted-scoring system (`src/features/recommendations/`) — not an LLM, not
a black box — that produces Top-5 destination recommendations with a match
percentage and 2-4 plain-English reasons, plus the optional 7-step
onboarding wizard that feeds it, guest-side preference persistence, an
authenticated preferences editor on `/profile`, and a context-aware
"Recommended Nearby" upgrade on festival/destination detail pages. Both
signed-in and anonymous/guest visitors get real recommendations; only
signed-in visitors with no preferences set (or guests before onboarding)
see the honest anonymous fallback, never a fabricated match score.

### 1. Preference model

`UserPreference` gained real fields, replacing two Phase 1 placeholders
that nothing had ever written data to: `travelStyle` now uses the
onboarding UI's actual vocabulary (`BACKPACKER | BUDGET | COMFORTABLE |
LUXURY`, replacing `RELAXED | ADVENTURE | CULTURAL | OFFBEAT | MIXED`), and
`crowdPreference` became a continuous `Int` (0 busy/lively .. 100 quiet/
peaceful) replacing a 3-value enum, per the spec's explicit "store it in a
way that can be used numerically." New: `budgetAmount: Int?`, a numeric
total-trip budget in INR alongside the existing `budgetLevel` bucket (kept
in sync via `deriveBudgetLevel()`). Interests reuse the existing `Tag`
taxonomy (`category: INTEREST`) unchanged — full rationale in
`docs/database.md`.

### 2. Onboarding flow

`src/components/onboarding/OnboardingWizard.tsx` — 7 steps (dates,
duration, travellers, budget, interests, travel style, crowd preference),
chips/presets/a slider per the spec's "avoid giant forms," a progress bar,
Back/Next, and skip/finish-early available at every step ("Skip for now"
before any answer is given, "Save & finish" once at least one is). One
wizard, reused for both first-time onboarding (`mode="onboarding"`) and
profile editing (`mode="edit"`) — same steps, same validation. Persistence
is the caller's job, not the wizard's: `OnboardingLauncher` decides guest
store vs. `PUT /api/preferences` based on session state.

### 3. Recommendation scoring model

`src/features/recommendations/scoring.ts` — per-signal functions
(interest/travel-style/crowd/duration fit → blended into "personal fit";
season-or-date fit; budget fit; festival/destination-connection fit;
quality; uniqueness; popularity), each normalized to 0..1, composed into
one weighted sum (`scoreDestination`/`scoreFestival`). `matchPercent` is
literally `Math.round(score * 100)` of that same sum — no separate
"confidence" number invented for display. Full model + the two-path
(anonymous-fallback vs. scored) architecture writeup is in
`docs/architecture.md`.

### 4. Initial weights

`src/features/recommendations/weights.ts` — `DEFAULT_WEIGHTS` (personal fit
40%, season/date fit 20%, travel quality 15%, uniqueness 10%, budget fit
5%, festival/event fit 5%, popularity 5%) matches the spec's own §18
illustrative table exactly; `DEFAULT_PERSONAL_FIT_WEIGHTS` (interest 40%,
travel style 25%, crowd 20%, duration 15%) is this codebase's own choice
where the spec only named the four inputs without sub-weights — documented
as such, not presented as spec-derived. `DEFAULT_FESTIVAL_WEIGHTS` mirrors
the same shape with `dateFit`/`destinationFit` replacing `budgetFit`/
`festivalEventFit` (festivals have no cost-per-day field to compare a
budget against). All weights live in one file, imported everywhere they're
used — spec §39's "do not hardcode weights in multiple components."

### 5. Explanation engine

`src/features/recommendations/explain.ts` — ordered threshold checks
against the same signals the score was built from ("Matches your
interests" when `interest > 0.65`, "Fits your budget" when `budget >= 0.9`,
etc.), capped at 4, with a generic non-empty fallback ("Worth exploring")
so a low-signal match never shows zero reasons. Deterministic and
rule-based throughout — no LLM call anywhere in the recommendation path,
per the spec's explicit prohibition.

### 6. Diversity logic

`src/features/recommendations/diversity.ts` — greedy top-N selection: highest
score first, soft cap of 2 per category and per geography (a destination's
state, resolved from `Location.parentId`), with a second relaxed pass that
drops the caps only if the first pass couldn't fill all N slots — so a
narrow-interest user still gets 5 results (spec §28: "do not force
diversity when the user's interests are extremely narrow") instead of
fewer. Also the one place duplicates are dropped (spec §30).

### 7. Anonymous fallback logic

`hasPersonalizationSignal(context)` is the single gate: false for a truly
anonymous visitor (or a signed-in user with no `UserPreference` row) routes
every recommend* function through the *existing* Phase 5/6 ranked discovery
feed, wrapped with honest reasons ("Great time of year to visit", "A
traveller favourite") and `matchPercent: null` — never a fabricated
percentage, never "Personalized for you" copy for someone the system knows
nothing about (spec §24/§45). This is a real, verified fallback, not a
theoretical one — the Explore page's default (pre-onboarding) state was
screenshotted mid-session showing exactly this.

### 8. Guest preference persistence

`src/lib/guest/store.ts`'s `GuestState` gained a `preferences` field
(`setPreferences()`/cleared on `clear()`), written by `OnboardingLauncher`
for anonymous visitors and read by `RecommendationRail` on every fetch — so
completing onboarding from Explore's own inline CTA re-personalizes the
rail immediately, no reload, verified via headless browser. On sign-in,
`mergeGuestDataIntoAccount()` (`src/lib/guest/merge.ts`) imports the guest
snapshot into a real `UserPreference` row — but **only if the account has
none yet**: account data is authoritative, so a stale guest snapshot from
this browser can never silently overwrite preferences the user already set
post-sign-in ("use a clear merge strategy and do not silently destroy
information," spec §43). The actual sign-in-time *trigger* for this merge
(calling `/api/guest/merge` right after auth) is out of this phase's scope
by design — Phase 8 is literally titled "Guest-to-Account Sync."

### 9. Account preference persistence

`GET`/`PUT /api/preferences` — signed-in only, backed by
`getPreference()`/`upsertPreference()` (`src/features/users/service.ts`).
`/profile` server-renders the current preference summary and an
edit/set-preferences entry point (`PreferencesEditor`, a thin Client
Component — see the Server→Client bug below for why it can't be inlined
directly into the page).

### 10. Context-aware recommendation architecture

`recommendNearby()` reuses the existing geographic nearby queries
(`getNearbyToFestival`/`getNearbyToDestination`, Phase 4/5) rather than a
new geo system, then — only when the viewer has real preference signals —
re-scores that small nearby set with the same `scoreDestination`/
`scoreFestival` functions and attaches reasons. Building this exposed a
real, pre-existing asymmetry: `getNearbyToDestination()` only ever queried
other *destinations*, never nearby festivals (unlike its festival-side
counterpart, which already queried both) — so viewing a destination could
never surface a nearby festival no matter how close. Fixed by adding a
small `nearbyFestivalsForPoint()` helper inside the new recommendations
module itself (not by widening `getNearbyToDestination()`'s contract, which
other call sites depend on as a plain array) — verified end-to-end with
Dzükou Valley ↔ Hornbill Festival (12km apart in the seed data), which now
shows a 61%-match "Hornbill Festival" card under "Recommended Nearby."
Currently authenticated-only (see "Known limitations").

### 11. Caching strategy

Generic (non-personalized) recommendations ride on the same DB-query-level
performance the existing discovery feeds already have (indexed, bounded
result sets) — no new cache layer, which would be over-engineering for V1
volume. Personalized recommendations are deliberately **never**
server-rendered into a cacheable page response: Explore's recommendation
rail is a client component that POSTs to `/api/recommendations/destinations`
after mount specifically so nothing private ends up in a publicly-cacheable
HTML response (spec §51/§52 — "do not cache private recommendations in
publicly accessible caches," "personalized recommendations should not
create indexable pages"). `/search`-style `robots: noindex` wasn't needed
since no new page's *URL* carries personalization state.

### 12. Analytics events

Three new `AnalyticsEventType` values (`ONBOARDING_INTERACTION`,
`PREFERENCE_UPDATED`, `RECOMMENDATION_VIEWED`; migration
`20260831090000_personalization_preferences`). `ONBOARDING_INTERACTION` is
one generic type disambiguated by `metadata.action` (`started`, `completed`
— with a `partial` flag for early finishes, `skipped`), the same shape
Phase 6 established. Recommendation clicks reuse the existing
`RECOMMENDATION_CLICK`; recommendation saves/add-to-trip reuse the existing
`SAVE`/`ADD_TO_TRIP` with a new optional `metadata.source` (added to
`SaveButton`/`AddToTripButton`/`useSavedState`) rather than inventing
`RECOMMENDATION_SAVED`/`RECOMMENDATION_ADDED_TO_TRIP` variants for the same
underlying action. "Recommendation dismissed" (spec's own "if implemented")
and "match score interaction" (spec's own "if useful") were both left
unimplemented — neither hedge phrase reads as a hard requirement, and
dismissal specifically would need real UI (undo, persistence) disproportionate
to a V1 nice-to-have.

### Files created/modified

New: `src/features/recommendations/` (`types`, `weights`, `scoring`,
`explain`, `diversity`, `context`, `service`, `index`),
`src/components/onboarding/` (`OnboardingWizard`, `OnboardingLauncher`,
`types`, `index`), `src/components/recommendations/` (`RecommendationCard`,
`RecommendationRail`, `index`), `src/components/ui/Slider.tsx`,
`src/lib/preferences/budget.ts`, `src/app/api/preferences/route.ts`,
`src/app/api/recommendations/destinations/route.ts`,
`src/app/profile/PreferencesEditor.tsx`, `src/lib/validation/{preferences,
recommendations}.ts`, `prisma/migrations/20260831090000_
personalization_preferences/`. Rewritten: `src/app/profile/page.tsx` (real
preference summary, replacing the Phase 1 stub). Modified:
`prisma/schema.prisma`, `src/features/users/{service,types}.ts`
(`listInterestTags`, `budgetAmount`/numeric `crowdPreference`), `src/lib/
guest/{types,store,merge}.ts` (guest preferences), `src/lib/validation/
{guest,map}.ts` (new schemas/event types), `src/app/explore/page.tsx`
(the old static "Best Places This Month" section replaced by
`RecommendationRail`, which subsumes it — personalized when possible,
identical anonymous ranking otherwise), `src/app/{destinations,festivals}/
[slug]/page.tsx` (personalized "Recommended Nearby" for signed-in
visitors), `src/config/nav.ts` unchanged. Deleted: `src/lib/recommendations/`
— the Phase 1 scaffold stub (unused by any real code, and broken outright
by the `CrowdPreference` enum removal) is fully superseded by
`src/features/recommendations/`.

### Two real bugs found and fixed this phase

1. **A Server Component passed a function prop to a Client Component.**
   `/profile`'s server-rendered page crashed for every signed-in visitor
   ("Functions cannot be passed directly to Client Components") because it
   passed `OnboardingLauncher` a `renderTrigger` function directly. Neither
   `tsc` nor `next build` catches this — only the server's runtime log and
   an actual signed-in page load did. Fixed with a thin Client Component
   wrapper (`PreferencesEditor`) that builds the function client-side
   instead. Full writeup in `docs/architecture.md`.
2. **New analytics event types reached the Prisma enum but not the Zod
   validation schema.** `RECOMMENDATION_VIEWED` (and its two siblings) were
   added to `schema.prisma` and the migration but not to
   `analyticsEventSchema` in `src/lib/validation/map.ts` — the separate list
   `/api/analytics/track` actually checks. Every view of the recommendation
   rail silently 400'd on its own tracking call. Caught by logging every
   failed network response during headless-browser verification, not by
   any type check. Same failure shape exists for Phase 6's four event types
   (added correctly, together, that time) — noted as a "grep for
   `analyticsEventSchema` when adding an event type" discipline point.

### Tests/checks performed

- `npm run typecheck`, `npm run lint`, `npm run build` — all clean.
- Real end-to-end verification via headless Chromium against the
  **production build**, including a from-scratch authenticated session
  (a real `User` + database `Session` row created directly against the dev
  Postgres instance, with its `sessionToken` set as the browser's Auth.js
  cookie — since this environment has no working OAuth/SMTP credentials to
  drive a real sign-in flow): guest onboarding via Explore's inline CTA
  (rail goes from anonymous "Best This Month" to "Recommended for You" with
  real match percentages, no reload); the full 7-step wizard via
  `/profile` for a signed-in user (preferences actually persisted and
  redisplayed after `router.refresh()`); the signed-in Explore rail
  (personalized, match badges visible); context-aware "Recommended Nearby"
  on both a destination page (Dzükou Valley) and a festival page (Hornbill
  Festival) for the same signed-in, preferences-set user; the anonymous/
  cold-start Explore state (no match badges, honest reasons, working
  onboarding CTA); and a broad regression sweep (home, map, festivals/
  destinations listings, hidden-india, calendar, both detail pages, mobile
  viewports for explore/profile/calendar) — zero console errors or failed
  requests anywhere in the final run.

### Known limitations

- Context-aware "Recommended Nearby" personalizes for signed-in visitors
  only — guests keep the unchanged plain nearby list, since the server
  can't see a guest's client-side preferences on a server-rendered detail
  page without adding a client-fetch waterfall there too (see
  `docs/architecture.md`'s "scope trims" section).
- Map integration (spec §32) wasn't wired this phase — a documented,
  deliberate trim, not an oversight (see `docs/architecture.md`).
- Explore's visible "Top 5" rail is destinations-only; `recommendFestivals`
  is real and exercised via `recommendNearby`, but doesn't have its own
  homepage-style rail yet.
- Duration fit is a coarse heuristic (no per-destination "typical visit
  length" field exists to score against) — documented in `scoring.ts`
  rather than presented as more precise than it is.
- "Recommendation dismissed" and "match score interaction" analytics were
  not implemented — both were explicitly hedged as optional in the spec.
- No automated tests — same gap noted in every prior phase.

---

## Phase 8 — Accounts, Saves, Visited & Guest-to-Account Sync

**Status: complete.**

### Summary

Completed the personal account layer: guest-capable "Mark as Visited" (was
authenticated-only until now), an automatic guest→account merge that fires
the instant a guest signs in with no user action required, a rebuilt
`/profile` with real Saved/Visited/Trips/Account tabs, optimistic save/
visited with rollback-on-failure, and a real Auth.js sign-in error page.
Along the way, found and fixed a genuine cross-component React hydration
race in the guest store — not a cosmetic bug, a real error #418 reproduced
with a minimal repro and fixed with a second, independent guard layer once
the textbook fix (`skipHydration` + a root-level rehydrate effect) turned
out insufficient under Next.js's streaming hydration model — and separately
caught an incomplete first pass at diagnosing `/admin`'s protection before
it shipped as a false "bug fixed" claim: `/admin` was already correctly
gated (since Phase 2, under `src/proxy.ts`), just documented with two stale
comments referencing Next.js 16's pre-rename `middleware.ts` name.

### 1. Authentication provider/architecture

Unchanged from Phase 1 — Google OAuth + Auth.js's passwordless
Nodemailer/magic-link email, both via the Prisma adapter, no custom
password hashing. Phase 8's own spec text asks for "email + password" in
one section while its section 3 prohibits "custom password hashing or
authentication cryptography" in the next — a direct self-contradiction,
since a password provider *is* exactly that. Magic-link email satisfies
both halves (it's still "email authentication," and Auth.js "naturally
handles verification" per the spec's own escape hatch) without adding a
second, contradicting method. Documented directly in `src/lib/auth/
config.ts`'s comment, not just here, since that's where the next reader
would look.

New this phase: `authConfig.events.createUser`/`.signIn` for
server-side, authoritative `AUTH_INTERACTION` analytics (`signup_completed`
fires exactly once per account, from Auth.js's own lifecycle — a cleaner
signal than anything client code could infer). `/admin`'s protection was
also verified this phase (see #9) — it was already correct, not newly added.

### 2. Guest persistence architecture

`src/lib/guest/store.ts` — one versioned Zustand store
(`traveldiary.guest.v1`), one dedicated abstraction, already satisfying the
spec's "do not scatter raw localStorage calls... use a structured
namespace" without needing to split into the spec's illustrative
`travelDiary:guest:saves`/`:visited`/`:preferences` multi-key example.
`GuestState` gained `visitedItems` this phase (mirroring `savedItems`
exactly) — visited was previously authenticated-only, since the Phase 1
guest architecture only ever covered save + trips. `DiscoveryKind` gained
a `"food"` variant (`SaveButton kind="food"` now appears next to Food
items on festival/destination detail pages) since the spec explicitly
lists food as saveable (§10) and there was previously no saveable surface
for it at all — no `/food/[slug]` page exists yet, so these save without a
detail-page link, the same "no href yet" treatment Experience/Event items
already got in Phase 6's search results.

### 3. Account persistence architecture

Unchanged shape (`SavedContent`/`VisitedContent`, `(userId, contentType,
contentId)` unique-constrained rows, existence-is-state) — new this phase
is *reading* them back: `resolveContentRecords()` in `src/features/users/
service.ts` batches the polymorphic ids per content type (one query per
type present, not one per row) and returns them with image/href/location
resolved, powering the profile's Saved/Visited tabs. A row whose target
content was since deleted is silently dropped rather than crashing the
list — the same "service layer owns this integrity, not the database"
trade-off documented on the `Media` model applies here too.

### 4. Guest-to-account merge strategy

The automatic trigger (spec §21: "the most important part of the phase")
is `src/components/account/GuestMergeSync.tsx`, mounted once in the
provider tree. It watches `useSession()`, and the instant `status`
becomes `"authenticated"`, checks whether the guest store has *any*
content; if so it `POST`s the full snapshot to `/api/guest/merge` and only
clears local state after a successful response. No button, no prompt — it
just happens.

Per-field strategy (spec §22):
- **Saves/visited**: `local ∪ server → true`, via
  `SavedContent.upsert`/`VisitedContent.upsert` with a no-op `update: {}`
  — the exact same shape for both, since they're structurally identical.
- **Preferences**: account-authoritative. If the account already has a
  `UserPreference` row (Phase 7), the guest snapshot is never imported
  over it — only a guest signing into an account with *no* preferences
  yet gets theirs carried over. This was actually built in Phase 7 (the
  preference half of this merge predates this phase); Phase 8 added the
  saved/visited halves and, critically, the trigger that ever calls any
  of it.
- **Trips**: skipped if a trip with the same name already exists for the
  account, to avoid duplicating something already synced.

### 5. Merge failure/retry behavior

Idempotent by construction, not a separate "already merged" flag: every
write above is naturally safe to repeat (unique-constrained upserts,
name-based trip dedup, preference-only-if-empty). Local guest state is
never cleared until the server confirms success (spec §24), so a failed
request leaves everything as-is and a later mount (e.g. the user reloads)
simply retries with the same still-present data — no toast or retry UI was
built for this specific background sync, since nothing is lost by staying
silent and retryable; a user-visible failure state was judged
disproportionate for an automatic, no-action-required background process.

### 6. Save model

Unchanged data shape, but now genuinely optimistic (spec §15) for
authenticated users: `useSavedState` flips the UI immediately on click,
then syncs; a failed request reverts the flip and surfaces a small inline
error (`SaveButton` renders it below the button, `role="alert"`) rather
than leaving the UI claiming an unconfirmed state. Guests still write
straight to the local store (no network round trip to be optimistic
about). Duplicate prevention remains DB-level (`@@unique([userId,
contentType, contentId])`, unchanged since Phase 1) — spec §16's "enforce
at the database level, not only frontend checks" was already true before
this phase.

### 7. Visited model

Was authenticated-only; now mirrors Save exactly, guest-capable via the
same store, same optimistic-update-with-rollback shape
(`useVisitedState`). `VisitedButton` no longer redirects guests to sign in
— it just works locally, same as Save always did.

### 8. Preference synchronization

Unchanged from Phase 7 (`GET`/`PUT /api/preferences`, `/profile`'s
Preferences tab reusing `OnboardingWizard` via `PreferencesEditor`) —
Phase 8 didn't need to touch this beyond making sure the profile page
still renders it correctly inside the new tab structure, and beyond the
recommendation engine now also reading `userId` for the visited-penalty
(see `docs/architecture.md`).

### 9. Security/authorization approach

Every private API route already derived identity from `auth()`'s
server-side session, never a client-supplied id (unchanged since Phase 1)
— spec §38/§40's core requirement was already met going into this phase.
`/admin` was double-checked too, since its own code comments claimed
protection "enforced in middleware.ts" and no file by that name exists —
Next.js 16 renamed the convention to `proxy.ts` (see `docs/architecture.md`
for the full finding). That rename was initially misread as "the guard
file is missing" until `git log -- src/proxy.ts` showed it's been present
and correct since Phase 2 — the comments were just stale, not the
protection. Verified (rather than assumed) via direct HTTP requests, since
this environment's `AUTH_URL` points at a different port than the one used
for testing: signed-out → 307 to sign-in, signed-in non-admin → 307 to
sign-in, signed-in admin → 200 — all already true beforehand. No rate
limiting was added beyond what the hosting platform provides by default —
spec §41's own hedge ("do not build a massive security platform... use
provider/platform capabilities where possible") reads as explicitly
deferring this to deployment infrastructure, not application code.

### 10. Analytics events

Three new `AnalyticsEventType` values this phase: `AUTH_INTERACTION`
(generic + `metadata.action`, mirroring the Phase 6/7 pattern —
`signup_started`/`signup_completed`/`login`/`logout`), `VISITED` (its own
type, not folded into something generic, since it's a first-class
content-state action symmetric with the existing `SAVE`), and
`GUEST_MERGE`. This time the Zod `analyticsEventSchema`
(`src/lib/validation/map.ts`) was updated in the *same* change as the
Prisma enum — Phase 7's report flagged forgetting this exact step as a
recurring risk, and it was caught here by discipline rather than
tooling.

### Files created/modified

New: `src/components/account/` (`GuestMergeSync`, `GuestStoreHydrator`,
`ContentListItem`), `src/lib/hooks/useHasHydrated.ts`,
`src/app/profile/SignOutButton.tsx`,
`prisma/migrations/20260831130000_account_visited_analytics/`. Rewritten:
`src/app/profile/page.tsx` (tabbed Preferences/Saved/Visited/Trips/Account,
replacing the preferences-only Phase 7 version), `src/app/auth/sign-in/
page.tsx` (real error handling), `src/components/discovery/
{useSavedState,useVisitedState,SaveButton,VisitedButton}.tsx` (guest
support for visited, optimistic updates, error surfacing, the hydration
fix), `src/lib/guest/{types,store,merge}.ts` (visited items, skipHydration).
Modified: `src/proxy.ts` (documentation rewrite only — the gating logic was
already correct, see the security section above), `src/lib/auth/config.ts`
(events, comments), `src/app/admin/page.tsx` (comment), `src/app/
providers.tsx` (mounts the two new account components), `src/app/
{festivals,destinations}/[slug]/page.tsx` (Save buttons on Food items),
`src/components/map/DiscoveryPreviewPanel.tsx` (added VisitedButton, was
Save-only), `src/components/discovery/contentKind.ts` (added `"food"`),
`src/features/recommendations/{types,service}.ts`
(visited-deprioritization), `src/features/users/{service,types}.ts`
(`listSavedContent`/`listVisitedContent`), `src/lib/validation/
{guest,map}.ts`, `prisma/schema.prisma`, `docs/{architecture,database}.md`.

### One real bug found and fixed this phase, and one false alarm corrected before shipping

1. **A genuine React hydration mismatch in the guest store**, only
   reproducible with real (non-empty) guest data present at hydration
   time — full writeup in `docs/architecture.md`, including why the
   first, textbook fix wasn't sufficient. This was caught specifically
   because Phase 8's own spec (§48) asks to test "guest saves, then
   refreshes" — a test earlier phases had no reason to run.
2. **`/admin` protection was initially misdiagnosed as missing, then found to already be correct.** Two stale comments (`src/lib/auth/config.ts`,
   `src/app/admin/page.tsx`) referenced a `middleware.ts` that Next.js 16
   renamed to `proxy.ts` — but `src/proxy.ts` already existed, committed
   in Phase 2, with fully correct role-gating logic. The first search only
   checked for `middleware.ts` and (wrongly) concluded protection was
   missing entirely; `git log -- src/proxy.ts` during write-up caught the
   mistake before it shipped as a false "bug fixed" claim. The real,
   narrower fix: the two stale comments, and a documentation rewrite of
   the already-correct `proxy.ts` explaining the rename and why it matters
   (see `docs/architecture.md`) — no behavior change. Verified via direct
   HTTP requests (not full page navigation, since this environment's
   `AUTH_URL` points at a different port than the one used for testing):
   signed-out → 307 to sign-in, signed-in non-admin → 307 to sign-in,
   signed-in admin → 200 — confirming protection was already correct, not
   demonstrating a fix.

### Tests/checks performed

- `npm run typecheck`, `npm run lint`, `npm run build` — all clean.
- Real end-to-end verification via headless Chromium against the
  **production build**, including a from-scratch authenticated session
  (same technique as Phase 7: a real `User` + database `Session` row
  created directly, cookie set on the browser context — this environment
  has no working OAuth/SMTP credentials to drive an actual sign-in flow)
  plus a second, `role: "ADMIN"` user for the security check: guest
  save+visited surviving a real page reload (the exact scenario that
  originally reproduced the hydration bug — reverified clean after the
  fix, zero console errors); a genuine guest→account merge (built up
  saved/visited/preference state as a guest across two pages, then
  injected the session cookie to simulate signing in, confirmed the
  server received and persisted everything and localStorage was cleared
  only afterward); the merged content appearing correctly in `/profile`'s
  Saved/Visited tabs with working unsave/unvisit toggles right from the
  list; account saves persisting in a fresh browser context with the same
  session (cross-"device" simulation); `/admin` access for signed-out,
  signed-in-non-admin, and signed-in-admin; the sign-in page's error
  message for a real Auth.js error code; and a broad regression sweep
  (home, map, festivals/destinations listings, hidden-india, search,
  both detail pages, trips, sign-in, mobile profile) — zero console
  errors or failed requests anywhere in the final run.

### Known limitations

- No rate limiting was added at the application layer — deferred to
  hosting-platform capabilities per the spec's own hedge (see #9).
- The guest→account merge has no conflict-review UI — a failed/retried
  merge is silent and automatic, with no user-visible progress or error
  state, since it's a background process with no user action to attach
  feedback to.
- Search results still don't show a Save affordance (Phase 6's own "do
  not overload results" instruction was judged to still apply) — spec
  §13 hedges this as "where appropriate."
- No automated tests — same gap noted in every prior phase.

---

## Phase 9 — Trip Planner & Itinerary Builder

**Status: complete.**

### Summary

Built the first complete trip planner: create/edit/duplicate/delete trips
as a guest (localStorage) or an account (Postgres), add content from any
destination/festival/experience/food/event page via a real "Add to Trip"
flow, a day-by-day itinerary editor with accessible reorder/move-day
controls, a trip-scoped map synchronized to the itinerary, a transparent
budget-range estimate, festival date-conflict warnings, geo-proximity
"you might also like" suggestions, and public/unlisted trip sharing. One
presentational component (`TripPlannerView`) renders the whole editor for
both guest and account trips; two thin wrappers supply its callbacks
against localStorage or the API respectively. Caught and fixed one real
bug before it shipped — sharing would have 404'd on its own freshly-copied
link — documented in `docs/architecture.md`.

### 1. Trip data architecture

`Trip` (pre-existing since Phase 1) gained `startDate`/`endDate`
(`DateTime?`), `travellerCount` (`Int?`), and `locationId` (`String?`,
named-relation FK to `Location`) this phase. `days` is no longer a value
the UI sets directly — it's derived from `startDate`/`endDate` whenever
both are present (`computeTripDays()`, shared by client and server so they
can never disagree), falling back to a manually-set value only for a
dateless trip. `TripItem` (also pre-existing) is the same polymorphic
`(contentType, contentId)` reference shape `SavedContent`/`VisitedContent`
already use, plus `day`/`order`/`notes`. Every server-side trip function in
`src/features/trips/service.ts` is scoped to `userId`, never trusting a
client-supplied id (spec §39).

### 2. Guest trip persistence

`src/lib/guest/store.ts` (Zustand, `traveldiary.guest.v1`, `skipHydration:
true` — same guest architecture as Phase 8's saves/visited) gained
`createTrip`/`updateTripMeta`/`duplicateTrip`/`addTripItem`/
`removeTripItem`/`reorderTripItemsInDay`/`moveTripItemToDay`. Guest trip
items now carry a client-generated stable `id` (previously identity-less),
needed for remove/reorder/move to target a specific item independent of
array position. Since a guest itinerary has no server `Trip` row, its
budget/conflict/suggestion heuristics can't be computed client-side
(they need destination cost data, festival occurrence dates, and
geo-proximity queries the browser can't run) — `GuestTripEditor` fetches
them from two no-auth endpoints, `POST /api/trips/resolve` (existing) and
`POST /api/trips/insights` (new), both scoped to already-public content
only.

### 3. Account trip persistence

Full CRUD in `src/features/trips/service.ts`: `listTrips`, `getTrip`,
`createTrip`, `updateTrip` (recomputes `days` from the merged/existing
dates), `deleteTrip` (only cascades `Trip`/`TripItem` — never touches
`SavedContent`/`VisitedContent`, spec §34's "save state remains
independent from trip state"), `duplicateTrip` (new id, `"{name} (Copy)"`,
always forced to `PRIVATE` regardless of the source's visibility — a
duplicate never inherits public exposure automatically), plus item-level
`addTripItem`/`removeTripItem`/`reorderTripItemsInDay`/`moveTripItemToDay`.
`AccountTripEditor` (client) drives these through API routes, refreshing
via `GET /api/trips/[id]` after anything that can move the derived numbers
(see Architecture doc for why reordering specifically skips this refresh).

### 4. Guest-to-account merge strategy

Unchanged trigger from Phase 8 (`GuestMergeSync`, fires automatically on
sign-in) — Phase 9 extended what it merges. Trip creation during merge now
carries `startDate`/`endDate`/`travellerCount` and, critically, the
itinerary items themselves (`items: { create: draft.items.map(...) }`),
not just trip metadata. Fixed a real spec violation found while
implementing this: on a trip-name collision the merge previously did
`if (existing) continue` — silently *dropping* the guest's trip entirely.
Changed to the spec's own example: rename to `` `${name} (Imported)` ``.
Still idempotent on retry — the whole merge is one transaction (a partial
failure rolls back everything) and local state only clears after a
confirmed success, so the collision check only ever fires for a genuine
pre-existing same-named trip, never a retry artifact. Verified directly:
built a guest trip with an item, signed in via injected session, confirmed
the trip *and* its item appeared server-side and localStorage cleared;
re-ran the same "sign-in" against the now-empty guest state and confirmed
no duplicate trip was created.

### 5. Itinerary ordering implementation

`order` is an explicit per-day integer, written from array position on
every reorder — `reorderTripItemsInDay` runs one `db.$transaction` of
`updateMany` calls, one per item id, rather than shifting indices (spec
§45: "a robust ordering strategy"). Reorder controls are accessible
up/down buttons (`TripItemCard`), not drag-and-drop (spec §13/§53) —
`disabled` at the top/bottom of each day's list. Moving an item to a
different day (`moveTripItemToDay`) appends it to the end of the target
day's order rather than trying to preserve a position that doesn't exist
in the new day yet.

### 6. Day management

Day count isn't a field the UI can just increment: once a trip has both
`startDate` and `endDate` set, `computeTripDays` always recomputes `days`
from them, silently overwriting any direct `{days: n}` patch. "Add day" /
"Remove day" go through `applyDayCountDelta()` (`src/lib/trip/duration.ts`,
shared by both editors) instead — it extends/shrinks `endDate` by a day
when dates are set, or patches `days` directly when they aren't. "Remove
day" is only ever offered on the trailing day, and only when it's empty
(spec's own caution against silently orphaning an item on a day that no
longer exists) — enforced in `TripPlannerView`'s render, not just by
convention.

### 7. Map integration

`TripMap` (`src/components/trips/TripMap.tsx`) reuses the exact
MapLibre/OpenFreeMap setup the Living Map (Phase 3) uses — spec §20's "do
not build a second map system" — as a distinct, simpler component: fixed
day-numbered markers (colour cycles per day, `DAY_COLORS`) plus a
*dashed* line connecting them in itinerary sequence, deliberately dashed
per spec §22 ("do not pretend lines represent actual driving routes").
Clicking an item card or a map marker sets the same `selectedItemId` state
in the parent (`TripPlannerView`), highlighting the corresponding card and
giving the marker a heavier border — itinerary↔map sync in both
directions, spec §21. Verified visually: two-item trip renders two
numbered markers connected by a dashed line, positioned correctly relative
to each other on the India basemap.

### 8. Budget estimation

`estimateTripBudget()` averages `approximateCostPerDay` across the trip's
Destination items, multiplied by day count and traveller count, ±20% for a
range — never a single guaranteed number (spec §25). Returns `hasData:
false` when no item in the trip carries cost data at all, and
`BudgetEstimate` renders nothing in that case rather than a fabricated
"₹0 – ₹0". Verified end to end: a two-item trip with a costed destination
showed "₹14K – ₹21K, A rough estimate, not a guaranteed price."

### 9. Festival date conflict handling

`checkFestivalConflicts()` compares each Festival item's most relevant
occurrence (`pickRelevantOccurrence()`, reused from Phase 4/5) against the
trip's own dates, returning one of four statuses per item:
`CONFIRMED_CONFLICT` only when the occurrence's `dateConfidence` is
`CONFIRMED` or `ADMIN_VERIFIED` *and* it falls outside the trip window;
`UNCERTAIN` for any other confidence level falling outside the window (or
with no date at all) — spec §27's "never overstate certainty"; `NONE` when
it overlaps; `NO_TRIP_DATES` when the trip itself has no dates to compare
against. All three non-`NONE` paths were verified directly: a `CONFIRMED`-
confidence festival (Hornbill) outside trip dates showed "This festival is
outside your current trip dates."; an `EXPECTED`-confidence festival
(Pushkar Camel Fair) outside trip dates returned `UNCERTAIN`; the same
festival on a trip with no dates set returned `NO_TRIP_DATES`, never a
false conflict.

### 10. Public/private sharing architecture

`Trip.visibility` (`PRIVATE`/`UNLISTED`/`PUBLIC`, pre-existing) gates
`/trips/[id]/share`, a server component with no owner-only controls
(no edit/remove/reorder) and items whose content has since been deleted
silently skipped (that "no longer available" messaging is for the owner
while editing, not a stranger viewing the trip). `getSharedTrip()` grants
read access for *either* `PUBLIC` or `UNLISTED` — see `docs/architecture.md`
for why the initial `PUBLIC`-only version would have been a real bug given
that clicking "Share" auto-upgrades a `PRIVATE` trip to `UNLISTED` (never
straight to `PUBLIC`). The share page is never indexed
(`robots: {index: false}` unconditionally) — there's no public trip
directory this would ever surface in, and a personal itinerary (dates,
exact locations) isn't something to hand to a search engine by default
regardless of visibility. Verified: a private trip's `/share` link shows
the app's not-found page with no data leaked; sharing a trip generates a
working link that renders fully for a signed-out request.

### 11. Security/authorization

Every trip/item mutation route re-derives the owner from `auth()`'s
server-side session and passes it into the service layer, which scopes
every query by `userId` — a trip that isn't the caller's 404s (via a
try/catch around a `findFirst` that returns nothing) rather than leaking a
403 that would confirm the id exists. The two intentionally unauthenticated
routes — `/api/trips/resolve` and `/api/trips/insights` — only ever
resolve or compute against already-public content, never anything
user-specific, the same trust boundary Phase 8 established for guest
reads.

### 12. Analytics

One new `AnalyticsEventType`: `TRIP_INTERACTION`, generic +
`metadata.action` (`"item_reordered"`, `"day_changed"`, `"duplicated"`,
`"deleted"`) — the same shape as `MAP_INTERACTION`/`CALENDAR_INTERACTION`.
`TRIP_CREATED` and `ADD_TO_TRIP` (both pre-existing) are reused as-is. The
Zod `analyticsEventSchema` (`src/lib/validation/map.ts`) was updated in
the *same* change as the Prisma enum this time — a recurring miss flagged
in both the Phase 7 and Phase 8 reports, applied proactively here rather
than caught after the fact.

### Files created/modified

New: `src/app/trips/new/`, `src/app/trips/[id]/`
(`page.tsx`, `TripPlannerView.tsx`, `AccountTripEditor.tsx`,
`GuestTripEditor.tsx`, `share/page.tsx`), `src/app/trips/
{AccountTripCard,GuestTripsList}.tsx`, `src/app/api/trips/**`
(list/create, `[id]` CRUD + GET, `duplicate`, `items` add/remove/reorder/
move, `resolve`, `insights`), `src/components/trips/**` (`TripMap`,
`TripItemCard`, `TripCard`, `BudgetEstimate`, `TripSuggestions`, shared
`types.ts`), `src/lib/trip/duration.ts`, `src/lib/content/resolve.ts`
(relocated from `features/users/service.ts`), `src/lib/validation/
trips.ts`, `prisma/migrations/20260831160000_trip_planner/`. Rewritten:
`src/features/trips/{service,types}.ts` (was a placeholder), `src/app/
trips/page.tsx`, `src/components/discovery/AddToTripButton.tsx` (was a
local-state placeholder — now the real flow), `src/lib/guest/
{store,types,merge}.ts`, `src/lib/validation/{guest,map,index}.ts`.
Modified: `src/features/users/{service,types}.ts` (re-export
`resolveContentRecords`/`ResolvedContentItem` from the new shared
location), `src/components/discovery/contentKind.ts` (shared
`CONTENT_TYPE_LABEL`/`CONTENT_TYPE_TO_KIND`), `src/components/account/
ContentListItem.tsx` (uses the now-shared maps), `src/app/{destinations,
festivals}/[slug]/page.tsx`, `src/components/map/DiscoveryPreviewPanel.tsx`,
`src/components/recommendations/RecommendationCard.tsx` (all four:
`AddToTripButton`'s new required `kind` prop), `prisma/schema.prisma`,
`docs/{architecture,database}.md`.

### Tests/checks performed

`npm run typecheck`, `npm run lint`, `npm run build` — all clean. Full
headless-Chromium verification against the **production build**,
including a from-scratch authenticated session (same technique as prior
phases): guest trip creation → add items from two different content
types → itinerary render (images/names/locations, festival-conflict
banner) → day-move → reorder → reload-persistence → dashboard listing;
identical flow for an account trip, plus API-level confirmation of
persisted state after each mutation; budget estimate rendering with real
cost data; map rendering two day-numbered markers with a dashed connecting
line; duplicate (count +1) and delete (count -1) from the dashboard;
guest→account merge carrying a trip *and* its item, then a retried
"sign-in" against the already-merged (now empty) guest state producing no
duplicate; all three non-`NONE` festival-conflict statuses
(`CONFIRMED_CONFLICT`, `UNCERTAIN`, `NO_TRIP_DATES`) individually
triggered and confirmed; sharing a private trip (auto-upgrades to
`UNLISTED`, link works signed-out) and confirming a still-private trip's
share link is blocked; mobile viewport (390×844) render of the itinerary
editor; a regression sweep of `/explore`, `/map`, `/profile`. Zero console
errors or failed requests in the final run, aside from one transient
external tile-server hiccup unrelated to application code.

### Known limitations

- The `/trips/[id]/share` route returns HTTP `200` at the raw transport
  level even when it's rendering the not-found page (a whole-app,
  pre-existing Next.js streaming characteristic, not new to this phase —
  see `docs/architecture.md`). Real users see the correct content; a raw
  status-code check (bots, link checkers) would not observe a `404`.
- No conflict-review UI for the guest→account trip merge, same as Phase
  8's saves/visited merge — a name collision renames automatically
  rather than asking the user to choose.
- Nearby suggestions (`getTripSuggestions`) anchor on the *first*
  itinerary item that has coordinates, not a centroid of all items — a
  deliberate simplicity trade-off (spec §2: "simple," "not a complicated
  ... dashboard") that can suggest less-relevant nearby content for a
  trip that spans several far-apart regions.
- No automated tests — same gap noted in every prior phase.

---

## Phase 10 — Admin CMS & Content Operations

**Status: complete.**

### Summary

Built the first production admin CMS: full create/edit/publish/archive for
Festivals, Destinations, Experiences, and Food; Location management with
hierarchy-corruption guards; URL-reference Media management; Festival/
Destination category and Tag taxonomy management (with duplicate-name
prevention); a Verification queue surfacing exactly what needs a human
look; an admin audit log; and a real dashboard. Authorization is
defense-in-depth (route-level via the existing `src/proxy.ts`, layout-level
via a second independent session check, and service-level via
`requireAdmin()` on every mutation). Found and fixed one real, if narrow,
gap along the way: `Experience`/`Food` had no publish/draft lifecycle at
all before this phase — every row was implicitly public — and one
pre-existing asymmetry in `getFestivalBySlug`'s `destinations` relation
missing the status filter its `getDestinationBySlug` counterpart already
had.

### 1. Admin architecture

Admin mutations use Next.js Server Actions (`"use server"` files under
each `src/app/admin/<entity>/actions.ts`), not API routes — a deliberate,
documented departure from every prior phase's convention (full reasoning
in `docs/architecture.md`): admin forms carry nested array state
(tag/relationship id lists) that doesn't serialize cleanly through
`FormData`, and Next.js 16's own guidance treats Server Actions as the
current idiom for this exact shape of problem. The public product's API
routes are untouched. Each domain gets its own `admin-service.ts`
(`src/features/<domain>/admin-service.ts`) alongside its existing
public-read `service.ts` — every function takes `session` as its first
argument, asserts `requireAdmin(session)` as its first line, and records
an audit entry after a successful mutation. List pages are server
components reading `searchParams` for search/filter/pagination; edit
pages fetch once server-side and hand typed data to a client form.

### 2. Authorization model

Three independent layers, not one shared assumption:

1. **`src/proxy.ts`** (pre-existing since Phase 2) — route-level gate on
   `/admin/:path*`, redirects to sign-in unless `session.user.role ===
   "ADMIN"`.
2. **`src/app/admin/layout.tsx`** (new) — a second, independent session
   check wrapping every admin page, so the guard doesn't depend solely on
   the proxy matcher staying correctly scoped.
3. **`requireAdmin()`** (`src/features/admin/service.ts`, pre-existing,
   now the shared pattern for every admin service function and Server
   Action) — re-derives and re-checks the session at the point of
   mutation itself, the layer that actually matters per Next.js's own
   security guidance: "render-time gating is not a security boundary."

Verified directly: an anonymous request to `/admin` gets a 307 to
sign-in; a signed-in non-admin gets the same 307; a signed-in admin gets
200 and the real dashboard.

### 3. CMS entities supported

Festivals, Destinations, Experiences, Food, Locations, Media, Festival
Categories, Destination Categories (types), Tags — matching spec §1's
list exactly, plus Featured-content flags and Verification status/queue.
Experience and Food CMS are deliberately simpler single-page forms (no
tabs) per spec §16's own "keep the interface simpler than Festival/
Destination CMS"; Festival and Destination CMS are full tabbed forms
(Basic/Location/Dates/Content/Media/Taxonomy/Verification for festivals;
Basic/Location/Seasonal/Budget/Relationships/Media/Taxonomy for
destinations).

### 4. Publishing workflow

`ContentStatus` (`DRAFT | PUBLISHED | ARCHIVED`) already existed on
Festival/Destination since Phase 1; this phase adds it to Experience and
Food, which had no publish state at all before now (every existing row
implicitly public). New rows default to `DRAFT`; existing seeded rows
were backfilled to `PUBLISHED` in the same migration so nothing already
live silently vanished. Every public read path that touches Experience/
Food was found and updated to filter `status: "PUBLISHED"` — the
top-level list/search/map queries plus the *nested* relation includes on
festival/destination detail pages, where the gap would have been easiest
to miss. One quick-action per admin table row (Publish/Unpublish/Archive)
avoids a full edit-page round trip for the common case. Verified: a draft
festival is absent from `/festivals` and its own `/festivals/[slug]`
until published, appears immediately after publishing, and disappears
again after archiving — checked via raw unauthenticated fetches of the
public routes, not UI-level absence alone.

### 5. Verification workflow

`/admin/verification` queries live data directly — no separate
"verification" storage of its own beyond fields that already existed
(`FestivalOccurrence.dateConfidence`, `Destination.verificationStatus`,
`lastVerifiedAt`, and a `Media` existence check per content id) — into
seven queues: festivals missing dates, festivals with uncertain dates,
unverified destinations, festivals/destinations missing images, and
festivals/destinations not verified in 180 days ("needs re-review," never
an "incorrect" claim — spec §34's own caution). Every row links straight
to its edit page. Festival verification (status/source) and destination
best-time verification are separate, purpose-built controls on their
respective edit pages, each writing `lastVerifiedAt` on save.

### 6. Media architecture

`src/lib/media/storage.ts` (Phase 1) already defines the real-storage
adapter shape but deliberately leaves `getUploadUrl()`/`deleteObject()`
throwing, since no storage credentials exist in this environment —
building a signed-upload flow that can't actually be exercised would be
worse than being explicit about the gap. The admin Media CMS accepts a
pasted image URL directly (the same shape seed data already uses) rather
than fake-implementing upload UI around a non-functional adapter. Alt
text is a required-in-spirit field with a placeholder example rather than
"image.jpg" (spec §22); order is a plain integer, no drag-reorder.
Wiring a real storage provider later is a configuration change (env vars
+ the two adapter methods + a `next.config.ts` remote pattern), not an
admin-UI change.

### 7. Relationship management

One component, `src/components/admin/RelationPicker.tsx` — a debounced
typeahead against `GET /api/admin/search` (admin-gated, deliberately
searches all content regardless of publish status) rendering removable
chips, exactly the `[Hornbill Festival ×] [Add festival]` shape spec §40
sketches. Used identically for every festival↔destination/experience/
food connection (all pre-existing many-to-many relations — no new join
tables needed), every tag assignment, and single-select location/category
pickers. No admin ever types an id.

### 8. Audit log implementation

New `AuditLog` model + `src/lib/audit/index.ts`, deliberately mirroring
`src/lib/analytics`'s three-layer shape (input type, `db`-backed recorder,
one call per mutation site) as a *pattern*, not an extension of that
table — spec §47 is explicit that admin actions are operational, not
product analytics. Every admin service function calls `audit.record()`
immediately after a successful mutation with `action`, `entityType`,
`entityId`, a denormalized `entityLabel` (so an entry stays legible after
the entity is later renamed/deleted), and `metadata` for meaningful
before/after values — used concretely for destination best-time overrides
(spec §15's "preserve the distinction between system suggestion and
admin decision," implemented by reusing the existing `bestTimeSource`
provenance field plus capturing the *prior* value in the audit metadata,
rather than adding parallel storage columns — full reasoning in
`docs/architecture.md`). `/admin/audit` lists every entry, newest first,
linking back to the relevant edit page. A failed audit write never blocks
or rolls back the actual admin mutation.

### 9. Cache invalidation strategy

The public site's content pages are already `force-dynamic` (no
server-side caching at all, per `docs/architecture.md`'s pre-existing
caching model) — an admin publish/archive is visible on the next request
with no invalidation needed. `revalidatePath(...)` is still called after
every admin mutation, targeting the relevant admin list/detail routes, so
the Next.js client router cache doesn't show stale admin data on the next
in-app navigation. The one path with real caching, `sitemap.xml`
(`revalidate: 3600`), is left on its existing hourly cycle rather than
force-invalidated — consistent with the existing doc's own reasoning that
crawlers don't need minute-level sitemap freshness.

### 10. Security controls

Every admin mutation re-verifies auth+role independently of the route
(§2 above). Ownership/existence checks return 404-shaped "not found"
errors rather than leaking existence via 403. `friendlyDbError()`
(`src/features/admin/service.ts`) translates Postgres foreign-key
violations (P2003 — e.g. deleting a Location still referenced by content)
into an actionable message and swallows every other raw DB error into a
generic one, so a stack trace never reaches the client (spec §45).
Location hierarchy mutations run a cycle check (`assertNoCycle`) before
reparenting, so an admin can't make a location its own ancestor. Category/
tag creation does a case-insensitive name check before insert (the DB
only enforces unique slugs). No new file-upload attack surface exists,
since there is no binary upload path (§6 above) — the one risk a URL-
reference field carries (arbitrary external URLs rendered as `<img>`) is
the same trust level the app already extends to seed data's image URLs.

### 11. Files created/modified

New: `prisma/migrations/20260831180000_admin_cms/`, `src/lib/slug.ts`,
`src/lib/audit/`, `src/lib/validation/admin.ts`, `src/features/admin/
{constants,verification}.ts` (+ `service.ts` extended), `src/features/
{festivals,destinations,experiences,food,locations,media,taxonomy}/
admin-service.ts`, `src/components/ui/Textarea.tsx`, `src/components/
admin/` (`RelationPicker`, `AdminTable`, `StatusPill`, `StatusQuickActions`,
`AdminSidebar`), `src/app/admin/layout.tsx`, `src/app/admin/{festivals,
destinations,experiences,food,locations,media,categories,tags,
verification,audit}/**` (list/new/[id] pages, forms, `actions.ts` per
entity), `src/app/api/admin/search/route.ts`. Rewritten: `src/app/admin/
page.tsx` (real dashboard). Modified: `prisma/schema.prisma` (Experience/
Food status+featured, Tag archived, AuditLog+AuditEntityType), `src/
features/{festivals,destinations,map,search}/service.ts` and `src/app/api/
map/discovery/route.ts` (added the missing `status: "PUBLISHED"` filters
described in #4), `src/lib/validation/index.ts`, `src/components/ui/
index.ts`, `docs/{architecture,database}.md`.

### Tests/checks performed

`npm run typecheck`, `npm run lint`, `npm run build` — all clean. Full
headless-Chromium verification against the **production build** with two
from-scratch sessions (a fresh `ADMIN`-role user and a fresh `USER`-role
user, same direct-session-creation technique as every prior phase):
anonymous/non-admin/admin authorization at `/admin`; dashboard rendering
real counts and a "needs attention" queue; a complete festival lifecycle
end to end — create as draft → confirm absent from `/festivals` (raw
fetch) → publish → confirm present → add a confirmed occurrence (date
displayed correctly) → add an image with alt text via the Media tab →
update verification status → archive → confirm absent again; a complete
destination lifecycle — create → override best-time months (confirmed
"Admin-overridden" badge + audit log entry with the prior value) → set
budget → publish → confirm present on `/destinations`; Location deletion
correctly blocked (disabled) for a location with sub-locations; category
creation correctly blocked on a case-insensitive duplicate name; tag
creation/visibility; the verification queue rendering real, populated
data across all seven sub-queues; the audit log showing entries for both
the festival and destination test runs with correct labels; a regression
sweep of `/festivals`, `/destinations`, `/map`, `/trips`; and a mobile
viewport (390×844) render of an admin list page. Zero console errors in
the final run. Two rounds of test-script-only bugs were found and fixed
during this verification (a URL-matching regex that prematurely matched
`/admin/festivals/new` itself, and a locator that searched for a field's
*hint* text instead of its actual placeholder) — both confirmed as test
issues, not application bugs, by direct DB/screenshot inspection before
being written off.

### Remaining limitations

- No real file upload — Media is URL-reference only, since no storage
  credentials exist in this environment (see #6). Documented as a
  configuration gap, not a missing feature.
- Experience/Food categories remain free-form strings (`Experience.
  category`, `Food.region`), not real taxonomy tables like Festival/
  Destination categories — spec §23 asks for "Experience categories" and
  "Food categories" management, but neither model had a category table
  to manage; adding one for two content types with no other taxonomy
  need today was judged out of scope for this phase's "do not build an
  enterprise CMS" restraint. Tags (which already span all four content
  types) cover most of the practical need.
- No bulk operations (multi-select publish/assign-tag across many rows
  at once) — every action is per-row. Spec §37 explicitly allows this to
  be a V1 gap ("V1 *may* support limited bulk operations").
- No slug-change redirect strategy (spec §29) — changing a published
  slug does not currently preserve the old URL. No redirect mechanism
  (e.g. a stored slug-history table) exists yet anywhere in the app to
  build this on.
- Content preview reuses the real public page for already-published
  content (a genuine, zero-duplication preview) but has no dedicated
  preview renderer for drafts — spec §41's "avoid maintaining two
  separate rendering systems" was judged to outweigh building a second,
  parallel draft-only renderer; a draft's page copy shows "Publish to
  preview the live page" instead.
- No automated tests — same gap noted in every prior phase.

---

## Phase 11 — Analytics, Content Intelligence & Product Observability

**Status: complete.**

### Summary

Audited every existing analytics event against the phase spec's ~50-event
checklist, fixed the real gaps found (a `SAVE` event that couldn't tell
save from unsave; several missing trip events; a genuine duplicate-event
risk in server-fired `PAGE_VIEW`s), and added the two layers that didn't
exist yet: **Content Intelligence** (every meaningful search logged to its
own table, zero-result queries aggregated into scored, dismissible
"content opportunities") and **Technical Observability** (error capture,
per-operation performance timing, a health-check endpoint). Built
`/admin/analytics` — Overview, Activity-over-time chart, Discovery,
Search, Content Opportunities, Recommendations, Trips, System Health, all
behind Phase 10's existing authorization stack. Full event/architecture
documentation now lives in the newly-required `docs/analytics.md`.

### 1. Analytics architecture

Three deliberately separate tables for three deliberately separate
concerns (spec §2's "do not mix these together"): `AnalyticsEvent`
(product behavior, pre-existing since Phase 1) untouched in shape except
one addition (`anonymousId`); `SearchQueryLog` +
`ContentOpportunityDismissal` (new, Content Intelligence); `ErrorLog` +
`PerformanceLog` (new, Technical Observability). No new external
dependency anywhere — no charting library, no error-tracking SDK, no APM
client. Every new capability reuses the exact adapter-plus-DB-provider
shape `src/lib/analytics` and `src/lib/audit` (Phase 10) already
established: a plain input interface, a function that writes one row, and
never throws on its own failure.

### 2. Event naming convention

Unchanged from every prior phase and now written down explicitly for the
first time (`docs/analytics.md`): a small set of `SCREAMING_SNAKE_CASE`
`AnalyticsEventType` enum values, each disambiguated where needed by a
`snake_case` string in `metadata.action`. Continued rather than replaced
with the spec's flat `snake_case`-event-name sketch (`map_opened`,
`search_submitted`, ...) — the two conventions say the same thing, but the
enum gives Postgres a real, indexed, typo-proof column to group by, which
five prior phases' worth of events already depend on.

### 3. Major tracked events

Audited all ~50 spec-named events against actual call sites (full table
in `docs/analytics.md`). Confirmed already covered: page/festival/
destination views, the whole map interaction set, search open/result-
click/zero-result, calendar/explore interactions, the full onboarding/
preference/recommendation set, auth + guest-merge, save/visited. Fixed:
`SAVE` previously fired identically for save *and* unsave with no way to
tell them apart — now carries `metadata.saved: boolean`, mirroring
`VISITED`'s existing pattern. Added: `TRIP_INTERACTION` `"opened"`
(mount-once-guarded), `"item_removed"`, and `"shared"` — three trip
lifecycle events the app performed but never recorded. Deliberately left
uncovered: experience/food "viewed" (no public detail page exists for
either yet — nothing to track a view *of*), city/cluster map selection,
and "search refined" (spec's own "do not track every UI interaction," and
the last one was already explicitly excluded in this codebase's Phase 6
reasoning).

### 4. Search / content opportunity system

New `SearchQueryLog` table records every meaningful search (not just
zero-result ones) — `normalizeQuery()` (lowercase, trim, collapse
whitespace/trailing punctuation) is the grouping key, `rawQuery` is kept
for display. `getContentOpportunities()`
(`src/features/analytics/content-intelligence.ts`) aggregates zero-result
searches over the last 90 days, drops anything under 3 occurrences as
noise, and scores the rest with a documented, non-AI formula:
`score = recentSearches(≤30d) × 2 + olderSearches(31–90d) × 1` — every row
here is zero-result by construction, so volume weighted toward recency is
the only real signal left to rank on. Each opportunity offers four
actions (spec §47): search existing festivals/destinations for a
near-match, jump to creating one, or dismiss — dismissal hides the
opportunity (via `ContentOpportunityDismissal`, keyed by the normalized
query) without deleting the underlying search history.

### 5. Admin analytics dashboard

`/admin/analytics`, gated by the same three-layer authorization Phase 10
built (route middleware, layout session check, `requireAdmin()` per
query) — no new authorization code. Today/7d/30d/90d date ranges, each
comparison stat showing raw counts alongside a percentage that's withheld
(shown as "vs N prior" instead) whenever the prior period's count is
below 10, per spec §28's sample-size caution. One combined "Activity over
time" line chart (views/searches/saves/trips as four series) rather than
the spec's four separate small multiples — see #the chart section below.
Sections: Overview, Activity, Discovery (top festivals/destinations by
view count), Search (top queries + zero-result counts), Content
Opportunities, Recommendations, Trips (created, average itinerary size,
most-added content, public shares), System Health.

**Charts:** hand-rolled inline SVG, no library — followed the `dataviz`
skill's method end to end, including running its palette validator. The
app's own brand palette (marigold/navy/terracotta) *fails* categorical
chart-series validation (lightness band, chroma floor, CVD adjacent-pair
separation) when checked, so `ActivityLineChart` deliberately draws its
four series from the skill's own validated reference palette instead
(confirmed passing: `node validate_palette.js "#2a78d6,#eb6834,#1baf7a,#eda100"
--mode light` → all checks pass) — scoped to chart marks only; every
other admin surface (badges, buttons, `StatusPill`) keeps the app's brand
colors unchanged.

### 6. Recommendation analytics

Impressions (`RECOMMENDATION_VIEWED`, already deduped since Phase 7 via a
mount-guard ref) and clicks (`RECOMMENDATION_CLICK`) counted directly.
"Saved"/"added to trip" have no dedicated event types — they reuse the
generic `SAVE`/`ADD_TO_TRIP` events, attributed to a recommendation
surface by a truthy `metadata.source` (checked in application code, not a
Prisma JSON-path filter — simpler and more robust than expressing
"present and truthy" against Postgres's JSON null semantics at this event
volume). This mirrors how the app already avoided adding
`RECOMMENDATION_SAVED`/`RECOMMENDATION_ADDED_TO_TRIP` variants back in
Phase 7 — same action, different originating card.

### 7. Trip / account analytics

Trips: created count, average itinerary size (computed from live
`Trip`/`TripItem` rows, not analytics events, since that's the ground
truth), most-added destinations/festivals (`TripItem` grouped by
`contentId`), public shares (`TRIP_INTERACTION` `action:"shared"`, new
this phase). Account: signup/login/logout/guest-merge conversion already
existed via `AUTH_INTERACTION`/`GUEST_MERGE` (Phase 8) and needed no
changes — the dashboard doesn't currently surface a dedicated Account
section, since Phase 8's own account metrics (saved/visited/trip counts)
already live on `/admin`'s dashboard from Phase 10 and duplicating them
here was judged unnecessary.

### 8. Error tracking

`src/lib/errors/index.ts`'s `captureError()` — no vendor SDK (none
installed, none configured; same reasoning Phase 10 applied to Media
storage). Writes `message`/`stack`/`path`/`severity` to `ErrorLog`,
console-logs unconditionally, never throws on its own failure. Wired into
`src/app/error.tsx` (route-segment boundary — Next.js 16 renamed the
`reset` prop to `retry`, confirmed against `node_modules/next/dist/docs`
before writing this per this repo's own `AGENTS.md`) and
`src/app/global-error.tsx` (root-layout boundary — deliberately
plain/dependency-free markup, since this file *replaces* the root layout
when active and can't rely on its fonts/providers/router context being
alive). Both POST to `/api/errors/capture`, a Zod-validated, unauthenticated
route (error reporting has to work for a visitor who isn't signed in).

### 9. Performance monitoring

`measureAsync()` (`src/lib/performance/index.ts`) wraps a named operation,
times it, and unconditionally logs duration + success/failure to
`PerformanceLog` — not sampled, since V1 traffic is low enough that
logging every call is cheap (documented retention keeps the table
bounded, see #12). Applied to exactly the surfaces spec §33–§36 name:
`map.viewport`, `search.query`, `recommendations.destinations`/
`.festivals`, `nearby.festival`/`.destination` — each wrapped by renaming
the existing function's body to a private `...Impl` and exporting a thin
`measureAsync(...)` wrapper, so no internal logic changed.

### 10. Health-check implementation

`GET /api/health` — no authentication (an uptime monitor/load balancer
can't sign in), checks database connectivity via a bare `SELECT 1`,
returns `{status, checks: {application, database}, timestamp}` with a 503
on failure. No internal topology, query plans, or secrets in the
response. `/admin/analytics`'s System Health section adds admin-only
context on top: 24h error count, 24h slow-request count (>1s), and
average search/map latency, computed from `ErrorLog`/`PerformanceLog`.

### 11. Privacy approach

Never sent to analytics: passwords, auth tokens, private trip notes,
raw preference values, or anything not on the explicit event list in
`docs/analytics.md`. `metadata` payloads are hand-assembled per call site,
never a serialized request/response dump. Admin analytics are aggregate
wherever the underlying question is aggregate by nature (no screen shows
one visitor's individual search/browsing history); `/admin/analytics`
carries the identical three-layer authorization every other `/admin/*`
route has. Anonymous identity is a random client-generated UUID, never a
fingerprint — see #the known gap below for its one honest limitation.

### 12. Data retention approach

Documented in `docs/analytics.md` as an explicit policy for a future
scheduled job (not automated in this phase — no cron/scheduled-task
infrastructure exists yet to hang it on): 12 months for
`AnalyticsEvent`/`SearchQueryLog` (long enough to compare season over
season, which matters for a seasonal-travel product), 30 days for
`ErrorLog`/`PerformanceLog` (operational signal, not historical trend),
indefinite for `AuditLog` (Phase 10, compliance-shaped) and
`ContentOpportunityDismissal` (a standing editorial decision, not a log
line).

### 13. Documentation created

`docs/analytics.md` (new, required by spec §49) — the full event catalog,
naming convention, anonymous-identity design (including its one honest
gap), duplicate-prevention strategy, Content Intelligence scoring formula,
Technical Observability implementation, admin dashboard structure, and
retention policy. `docs/architecture.md` and `docs/database.md` updated
with pointers into it rather than duplicating its content.

### Files created/modified

New: `src/lib/analytics/{anonymous-id,merge-identity}.ts`, `src/lib/search/
normalize.ts`, `src/lib/errors/index.ts`, `src/lib/performance/index.ts`,
`src/features/analytics/{content-intelligence,admin-service}.ts`,
`src/components/admin/charts/ActivityLineChart.tsx`, `src/app/admin/
analytics/**` (page, actions, `ContentOpportunities`), `src/app/api/
{health,errors/capture}/route.ts`, `src/app/{error,global-error}.tsx`,
`prisma/migrations/20260831200000_analytics_observability/`,
`docs/analytics.md`. Modified: `prisma/schema.prisma`,
`src/lib/analytics/{adapter,client,index}.ts` and `providers/db-provider.ts`
(anonymous id + dedupe window), `src/app/api/analytics/track/route.ts`,
`src/lib/validation/{map,guest,search,index}.ts` (+ new `errors.ts`),
`src/features/search/service.ts` (`SearchQueryLog` write + perf wrap),
`src/features/{map,recommendations,festivals,destinations}/service.ts`
(perf wraps), `src/components/discovery/useSavedState.ts` (save-direction
fix), `src/app/trips/[id]/AccountTripEditor.tsx` +
`GuestTripEditor.tsx` (opened/item_removed/shared events),
`src/components/account/GuestMergeSync.tsx` +
`src/app/api/guest/merge/route.ts` (analytics identity merge),
`src/components/layout/HeaderSearch.tsx` (anonymous id on live search),
`src/components/admin/AdminSidebar.tsx` (Analytics nav entry),
`docs/{architecture,database}.md`.

### Tests/checks performed

`npm run typecheck`, `npm run lint`, `npm run build` — all clean. Full
headless-Chromium verification against the **production build**: the
health endpoint returning `{status:"healthy"}`; a real search recording
to `SearchQueryLog`; three repeated zero-result searches for a unique
nonsense query correctly surfacing as a content opportunity with the
right score; dismissing it correctly emptying the Content Opportunities
section (verified with a direct server-side diagnostic after an initial
false alarm — the query legitimately still appearing in the separate,
intentionally-undismissable "Top Searches" table was mistaken for a
dismiss failure by an overly broad test assertion; a scoped check
confirmed the actual dismiss logic was correct all along); save/unsave
correctly toggling `metadata.saved`; a client error report round-tripping
through `/api/errors/capture` into `ErrorLog`; the admin analytics
dashboard rendering real data across every section including a working
chart, date-range switching, and system health reflecting real error/
performance counts; authorization boundaries (anonymous/non-admin/admin);
and a regression sweep of `/explore`, `/map`, `/trips`, `/admin`.

### Known limitations

- **Anonymous identity is client-only.** A visitor's UUID lives in
  `localStorage` and is attached only by `trackClientEvent()` — events
  fired directly from Server Component render code (`PAGE_VIEW`,
  `FESTIVAL_VIEW`, `DESTINATION_VIEW`) never carry one, only a `userId`
  when signed in. Threading it through server-rendered events would mean
  writing an identity cookie from `src/proxy.ts`, today scoped only to
  `/admin/:path*` — broadening a security-critical file's matcher was
  judged out of scope for this phase's risk tolerance. Documented rather
  than silently left unexplained.
- **`SEARCH_QUERY` carries two different metadata shapes** — the search
  service's own `{query, resultCount, rawMatchCount, usedFuzzyMatch}` and
  the map's inline result-selection `{source:"map", kind, name}`, a
  pre-existing overlap from Phase 3/6 left as-is (renaming an
  already-shipped event type was judged a bigger change than this
  phase's scope) but now documented in `docs/analytics.md` so a future
  query against `SEARCH_QUERY` rows knows to expect both.
- **No scheduled retention job** — the policy is documented (#12) but not
  automated; nothing currently deletes old rows.
- **Recommendation "saved"/"added to trip" attribution** relies on
  `metadata.source` being set by the calling card, which is a convention,
  not an enforced contract — a future card that forgets to pass `source`
  would undercount silently rather than error loudly.
- No automated tests — same gap noted in every prior phase.

---

## Phase 12 — SEO, Performance, Security, Accessibility & Production Hardening

**Status: complete.**

### Summary

Not a features phase — an audit-and-fix pass across all 11 prior phases'
code, per this phase's own instruction to "produce an internal audit
summary before making large changes before making large changes." Three
independent audits (security, performance, accessibility+SEO) ran first
and produced a written, evidence-cited findings list; every finding was
re-verified against the actual code before being counted (a few claimed
findings — the JSON-LD XSS escape, the trip-share 200-status — turned out
to already be correct or expected framework behavior, and were documented
as such rather than "fixed" a second time). This phase also built the
automated test suite this project didn't have before: 78 Vitest unit
tests and an 8-test Playwright E2E suite covering the three journeys
spec §64 names explicitly, plus a GitHub Actions CI workflow.

### 1. Security audit summary

Full detail in the newly-required `docs/security.md`. Confirmed intact:
the three-layer admin authorization stack (route middleware → layout
session check → per-function `requireAdmin()`), Server Actions each
independently re-deriving identity rather than trusting client input,
draft content never leaking through a public query (every public
`service.ts` filters `status: "PUBLISHED"` explicitly — verified by grep,
not assumed). Two known, accepted dependency vulnerabilities documented
(below). No secrets found in the repo or committed `.env` (it holds only
local-dev docker-compose credentials, as already documented).

### 2. Major security fixes

- **15 Server Actions** took a bare scalar argument (`id`, `status`,
  `domain`, `archived: boolean`) with zero runtime validation — a Server
  Action is a callable network endpoint, and TypeScript's type only binds
  the app's own compiled client, not an arbitrary request. Added
  `idSchema`/`contentStatusSchema`/`categoryDomainSchema`/`tagNameSchema`
  and a `safeParse` guard to each, across all 9 admin `actions.ts` files.
- **2 API routes** (`/api/map/state/[slug]`, `/api/admin/search`) parsed
  query params by hand instead of through a schema — brought in line with
  the `safeParse` → 400-on-failure pattern every other query-param route
  already used.
- **12 admin mutation functions** skipped `friendlyDbError()` — a bare
  `await db.x.update(...)` with nothing catching a thrown Prisma error,
  which would let a raw error propagate instead of failing the same,
  predictable way every other admin mutation does. Wrapped across
  `destinations|experiences|festivals|food|media|taxonomy`'s
  `admin-service.ts` files.
- **Security headers added sitewide** (`next.config.ts`):
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-
  Policy` opting out of camera/microphone/geolocation. A
  Content-Security-Policy was deliberately deferred — see `docs/
  security.md` for why guessing one blind (this app loads MapLibre's
  worker plus several environment-varying external hosts) was judged
  worse than documenting the gap honestly.
- **JSON-LD XSS escaping** — audit-flagged as missing on
  `festivals/[slug]`/`destinations/[slug]`; verification found both
  already had it (`.replace(/</g, "\\u003c")` after `JSON.stringify`).
  False positive, documented as such rather than "re-fixed."

### 3. SEO improvements

- **`/festivals` and `/destinations` gained `alternates.canonical`**
  pointing at their own unfiltered path — every state/month/category/
  popularity filter combination renders at the same URL via query params,
  and without this each filtered permutation was a distinct indexable
  page competing with the canonical one.
- **`/trips/new` gained `noindex`** via a new `src/app/trips/layout.tsx`.
  It's a Client Component (can't export `metadata` itself), the only
  private trip route that fell through the otherwise-consistent
  `robots: { index: false }` pattern every other `/trips/*` page already
  had.
- **Confirmed, not changed**: `notFound()` across the app (festival/
  destination/trip detail, the share page) returns HTTP `200` rather than
  `404` on a raw request — expected Next.js 16 Cache Components behavior
  (streaming commits the response status before `notFound()` can run),
  compensated by an auto-injected `noindex` meta tag. Already documented
  in this file's Phase 9 section; re-confirmed applicable here via
  `node_modules/next/dist/docs`, not re-litigated as a new bug.

### 4. Performance improvements

- **`/trips/[id]/share/page.tsx` was statically frozen** — no
  `searchParams`/`auth()`/`cookies()` use and no explicit `dynamic`
  export meant Next's Full Route Cache treatment: cached indefinitely
  after the first request, so a trip owner's edits never appeared to
  anyone who'd already loaded the share link once. This is the third time
  this exact bug class has hit the app (`/hidden-india`, `/explore`,
  now this) — fixed the same way, `export const dynamic =
  "force-dynamic"`, and flagged in `architecture.md` as a standing review
  item for future dynamic pages.
- **`adminListMedia`'s search filtered results *after* pagination** —
  since Media has no name column of its own (it's resolved from the
  parent content), a text search resolved labels for one already-paginated
  DB page and filtered client-side, making `total` wrong and potentially
  returning fewer than a full page despite more matches existing.
  Rewritten to resolve matching `(contentType, contentId)` pairs from the
  content tables first, then paginate the correctly-filtered query.
- **Map viewport fetch gained cancellation** — a pan/zoom firing a new
  `/api/map/viewport` request before the previous one resolved had no way
  to cancel the stale one; wired react-query's `queryFn({ signal })`
  through to `fetch`, so an in-flight request aborts instead of racing a
  newer one and possibly overwriting it with stale data.
- **Recommendation candidate queries gained a bounded cap.** The
  personalized-path `db.destination.findMany`/`db.festival.findMany`
  calls had no `take`, growing into a full-table scan as published
  content grows. Capped at 200 (`RECOMMENDATION_CANDIDATE_CAP`),
  `orderBy: { featured: "desc" }` first so the cap can't starve featured
  content the scorer would otherwise rank top.

### 5. Accessibility improvements

- **Missing form labels**: sign-in's email input (`<label>` +
  `htmlFor`), `RelationPicker`'s search input (same pattern via
  `useId()`), `AccountMenu`'s icon-only trigger (an inner `sr-only` span,
  matching the pattern `TripCard`'s own dropdown trigger already used).
- **Global `:focus-visible` fallback** added to `globals.css` — most
  interactive components already opt in with their own utility, this
  backstops anything that doesn't.
- **`ResponsivePanel` gained a real focus trap** — `role="dialog"
  aria-modal="true"` was a promise the component didn't keep. Now moves
  focus in on open, Tab/Shift+Tab wrap at the panel's edges, Escape
  closes, and focus returns to whatever opened it on close (Modal already
  got this for free from the native `<dialog>` element; ResponsivePanel
  is a side-panel/bottom-sheet layout that can't use that, so it's
  hand-rolled here).
- **Touch targets bumped** on `TripItemCard`'s move/remove icon buttons
  and `RelationPicker`'s remove-chip button, both previously under the
  24px minimum.
- **`role="alert"` added** to all 12 admin CMS form error messages, so a
  screen reader announces a failed save immediately instead of the error
  text sitting silently in the DOM.
- **Known, accepted, not fixed**: map markers have no keyboard-accessible
  click target (a WebGL-canvas architectural limitation — mitigated by
  `/festivals`/`/destinations`/search already providing full non-map
  access to every piece of content the map surfaces); `Dropdown` has
  Escape-to-close but no full roving-tabindex trap (reused too widely —
  header Explore menu, account menu, every admin table row — to risk a
  regression this late for the remaining gap). Both reasoned through in
  `docs/security.md`.

### 6. Database/query optimizations

Six missing indexes found and added (migration
`20260901090000_hardening_indexes`): `Experience.status`, `Food.status`,
`FestivalOccurrence.verifiedByUserId`, `TripItem.locationId`,
`AnalyticsEvent.userId`, `ContentOpportunityDismissal.dismissedByUserId`
— genuine gaps in FK/filter columns despite `database.md`'s prior "every
FK" claim, found by reading every `where`/`orderBy` in
`src/features/**/service.ts` against the actual index list rather than
trusting the doc. See `database.md`'s "Phase 12: hardening indexes."

### 7. Caching strategy

No new caching layer added — the fix here was removing an *unintended*
one (`/trips/[id]/share`'s static freeze, above). The app's existing
per-page dynamic/static split (documented across `architecture.md`'s
"Static rendering can silently freeze a 'live' content page" and its
Phase 12 addition) remains the caching model: explicit `dynamic` /
`revalidate` exports where content changes, static-by-default elsewhere.

### 8. Error/reliability improvements

`friendlyDbError()` coverage completed (12 functions, above) and Zod
validation completed (17 gaps across 15 Server Actions + 2 API routes,
above) are both reliability fixes as much as security ones — a request
that used to either crash with a raw error or silently misbehave now
fails predictably with an actionable message. `resolveFestivalStatus`/
`daysUntil` (below) is the one correctness bug this phase found and
fixed outright, not just hardened.

### 9. Test coverage and critical flows tested

**Unit (Vitest, `src/**/*.test.ts`)**: 78 tests across 11 files — festival
temporal status, seasonal fit, recommendation scoring/diversity/
explanation, trip budget estimation, slug generation, search
normalization, month-range math. One of these caught a real, previously
unnoticed bug: `resolveFestivalStatus`/`daysUntil`
(`src/features/festivals/status.ts`) did raw millisecond arithmetic
instead of calendar-day comparison, so a single-day festival flipped to
"Past" the moment UTC midnight ticked over on its own day — hours before
the day it was naming had actually finished for anyone in an India
timezone — and `Countdown` could show "1 day to go" for something
happening later that same day. Fixed by comparing whole UTC calendar days
instead of timestamps; two of the first tests written caught it
immediately.

**E2E (Playwright, `tests/e2e/`)**: 8 tests across 3 spec files, matching
the three journeys spec §64 ("FINAL PRODUCT AUDIT") names explicitly —
Homepage→Explore→Map→Festival→Save→Trip(create/add/reorder)→Share (ending
by opening the share link in a fresh unauthenticated browser context to
confirm it actually renders publicly), Search→Result→Content, and
Admin→Edit→Publish→Public page updated. Authenticates via a real database
session row (`session: { strategy: "database" }`) rather than automating
Google's OAuth UI. Full detail, including two real test-authoring
mistakes this suite exposed and fixed (a substring-match locator
un-saving what the previous run had saved; `networkidle` waits that never
resolve on a page with a live map widget), in the new `docs/testing.md`.

### 10. CI/deployment setup

`.github/workflows/ci.yml`: install → generate Prisma client → lint →
typecheck → migrate a `postgis/postgis:16-3.4-alpine` service container
(matching `docker-compose.yml`'s local image, since the schema needs
PostGIS) → seed → unit tests → production build → Playwright install →
E2E tests, with the Playwright HTML report uploaded as a build artifact
on failure. Runs on every push/PR to `main`. Deployment itself (an actual
hosting provider, domain, live monitoring) is Phase 14's job — this phase
produced the runbook (`docs/production.md`) it'll follow, not a live
deployment.

### 11. Environment configuration

No new required environment variables this phase. `docs/production.md`
documents which of `.env.example`'s variables are load-bearing in
production (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`) versus
gracefully-degrading, and the one exception (`MEDIA_STORAGE_*` throws
loudly rather than degrading, by design).

### 12. Backup/recovery documentation

Documented in `docs/production.md` as infrastructure the hosting provider
owns, not application code — this phase didn't (and structurally
couldn't) automate backups for a database that doesn't exist in
production yet. Minimum bar recorded for Phase 14: automated daily
backups, 7+ day retention, one verified test restore before go-live.

### 13. Monitoring/observability setup

No new capability — Phase 11 already built `/api/health`, `ErrorLog`, and
`PerformanceLog`. This phase's contribution is documentation
(`docs/production.md`'s "Monitoring & observability") making explicit
what exists (health check, error capture, performance timing) versus
what's still missing and belongs to Phase 14 (alerting — nothing pages
anyone today when `/api/health` fails or `ErrorLog` spikes — and any
monitoring external to the app's own infrastructure).

### 14. Files created/modified

**New**: `docs/production.md`, `docs/security.md`, `docs/testing.md`;
`.github/workflows/ci.yml`; `playwright.config.ts`, `vitest.config.mts`;
`tests/e2e/{primary-journey,search,admin-publish}.spec.ts` +
`tests/e2e/helpers/session.ts`; 11 unit test files under `src/**/*.test.ts`;
`src/app/trips/layout.tsx`; `prisma/migrations/20260901090000_hardening_indexes/`.

**Modified**: `next.config.ts` (security headers); `prisma/schema.prisma`
(6 indexes); `src/features/festivals/status.ts` (calendar-day fix);
`src/features/recommendations/service.ts` (candidate cap);
`src/features/media/admin-service.ts` (search-before-pagination fix); 6
more `admin-service.ts` files (`friendlyDbError` wrapping); 9 admin
`actions.ts` files (Zod validation); `src/lib/validation/{admin,map}.ts`
(new schemas); `src/app/api/{admin/search,map/state/[slug]}/route.ts`;
`src/app/trips/[id]/share/page.tsx` (force-dynamic);
`src/app/{festivals,destinations}/page.tsx` (canonical);
`src/app/map/MapPageClient.tsx` (fetch cancellation);
`src/app/auth/sign-in/SignInForm.tsx`, `src/components/admin/
RelationPicker.tsx`, `src/components/layout/AccountMenu.tsx` (labels);
`src/components/ui/ResponsivePanel.tsx` (focus trap);
`src/components/trips/TripItemCard.tsx` (touch targets); `src/app/
globals.css` (focus-visible fallback); 9 admin form/manager `.tsx` files
(`role="alert"`); `docs/{architecture,database,analytics,development}.md`.

### 15. Remaining known issues

- **No rate limiting anywhere** — sign-in, search, admin mutations all
  unprotected against abuse. Acceptable pre-launch (nothing publicly
  deployed yet), but the top item for Phase 14 before it is.
- **No Content-Security-Policy** — deliberately deferred; needs the real
  production provider hosts to author correctly, not guessed blind (see
  `docs/security.md`).
- **Two accepted dependency vulnerabilities** (`nodemailer` — no fix
  available; `deepmerge-ts` via `prisma` — fix requires an unsafe
  downgrade), both with unreachable vulnerable code paths in this app —
  see `docs/security.md`'s table.
- **`Dropdown` lacks a full keyboard focus trap**; **map markers aren't
  keyboard-accessible** — both reasoned through above and in
  `docs/security.md`, not silently unaddressed.
- **No alerting** on `/api/health` failures or `ErrorLog` spikes — belongs
  to Phase 14.
- **E2E coverage is 3 journeys, not exhaustive** — the ones spec §64 names
  explicitly, not every admin CRUD path or edge case. Deliberate scope
  for this phase, not a gap to be alarmed by.

### 16. Recommended final pre-launch checklist

1. Add rate limiting to sign-in, search, and admin mutation endpoints.
2. Author and test a real Content-Security-Policy against the actual
   production provider hosts.
3. Choose and provision the production database (managed Postgres with
   PostGIS — see `docs/production.md`), verify point-in-time recovery is
   actually enabled, perform one test restore.
4. Set real `AUTH_SECRET`/`DATABASE_URL`/`AUTH_URL` and OAuth callback
   URLs matching the real domain — never the committed local-dev `.env`.
5. Wire alerting to `/api/health` and `ErrorLog` (uptime monitor +
   threshold alert, at minimum).
6. Re-run `npm audit --omit=dev` — revisit the two accepted vulnerabilities
   in case an upstream fix has shipped.
7. Confirm `MEDIA_STORAGE_*` and `MAP_PROVIDER_KEY` are configured with
   real production values (both silently/loudly degrade without them —
   see `docs/production.md`).
8. Run the full CI pipeline (`.github/workflows/ci.yml`) green on the
   exact commit being deployed, not an earlier one.
9. Manually walk the three journeys spec §64 names, in a real browser,
   against the deployed (not local) environment, once.

---

<!-- Phase 13+ reports appended below as each phase completes. -->
