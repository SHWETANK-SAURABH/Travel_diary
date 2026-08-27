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

<!-- Phase 3+ reports appended below as each phase completes. -->
