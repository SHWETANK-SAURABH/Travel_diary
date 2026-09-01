# Analytics

The source of truth for every event this app tracks: what it's called, what
it carries, why it exists, and where it fires. See
[`architecture.md`](./architecture.md) for the three-layer system design
(Product Analytics / Content Intelligence / Technical Observability) and
[`database.md`](./database.md) for the underlying schema.

## Naming convention

Event **types** are `SCREAMING_SNAKE_CASE` Prisma enum values
(`AnalyticsEventType`), one per broad category of thing that happened —
`MAP_INTERACTION`, `TRIP_INTERACTION`, `CALENDAR_INTERACTION`. Within a
type, the *specific* action is a `snake_case` string in
`metadata.action` — `"month_selected"`, `"item_reordered"`,
`"day_changed"`. This two-level shape (a handful of typed enum values,
each disambiguated by a free-form but consistent action string) is the
convention every phase since Phase 6 has used; Phase 11 continues it
rather than introducing a flat `snake_case` event-name-per-action scheme,
since the two say the same thing and the enum gives the database a real,
indexed, typo-proof column to group by. A few event types don't need this
split at all — `PAGE_VIEW`, `FESTIVAL_VIEW`, `SAVE`, `VISITED` — because
the type alone is unambiguous, or (for `SAVE`/`VISITED`) the *direction*
is a boolean in `metadata` (`saved`/`visited`) rather than another string.

## Event schema

```ts
interface AnalyticsEventInput {
  type: AnalyticsEventType;
  userId?: string | null;
  anonymousId?: string | null;
  path?: string;
  contentType?: ContentType;
  contentId?: string;
  metadata?: Record<string, unknown>;
}
```

`createdAt` is a database default, not a client-supplied timestamp — this
avoids trusting client clocks and keeps ordering consistent with insert
order. There is no separate `sessionId` — `anonymousId` (below) already
identifies a returning signed-out visitor across their whole session and
beyond, and a `userId` unambiguously identifies a signed-in one; a third,
narrower identity wasn't judged to add anything a real product decision
would use.

## Anonymous identity

A visitor who has never signed in still gets one stable, privacy-conscious
identity: a random UUID generated client-side on first use and persisted
to `localStorage` (`src/lib/analytics/anonymous-id.ts`), the same
mechanism this app already uses for guest saves/trips. Every
`trackClientEvent()` call attaches it automatically — call sites never
pass one themselves. On sign-in, `src/lib/analytics/merge-identity.ts` is
called by the same flow that already merges guest saved-content/trips
(`GuestMergeSync` → `POST /api/guest/merge`): every `AnalyticsEvent`/
`SearchQueryLog` row still carrying that `anonymousId` with no `userId`
gets re-keyed onto the new account, rather than left as an orphaned,
duplicate identity.

**Known gap:** this identity is client-only by construction — a Server
Component can't write `localStorage`, so events fired directly from server
render code (`trackPageView`, `trackFestivalView`, `trackDestinationView`)
never carry an `anonymousId`, only a `userId` when signed in. Threading
anonymous identity through server-rendered events would mean writing it
via a cookie from `src/proxy.ts` (today scoped only to `/admin/:path*`) —
judged out of scope for this phase given the risk of broadening a
security-critical file's matcher. Documented here rather than silently
left unexplained.

## Duplicate-event prevention

Two layers:

1. **Component-local guards** for events that fire from a `useEffect` that
   could legitimately re-run (React Strict Mode, a parent re-render): a
   `useRef` flag set on first fire, checked before every subsequent one.
   Used by `RecommendationRail` (`RECOMMENDATION_VIEWED`), `GuestMergeSync`
   (`GUEST_MERGE`), and the trip editors' "opened" tracking
   (`TRIP_INTERACTION action:"opened"`).
2. **A short time-window dedupe in the DB provider**
   (`src/lib/analytics/providers/db-provider.ts`, `DEDUPE_WINDOW_MS =
   3000`): before inserting, checks for an identical event (same `type`,
   `path`, `contentType`, `contentId`, and identity) created in the last 3
   seconds, and silently skips the insert if one exists. This is the
   general-purpose fix for the case component-local guards can't cover —
   a Server Component re-rendering (RSC re-render, Next.js prefetch) can
   fire `trackPageView`/`trackFestivalView` more than once with no
   `useEffect` to guard it. Three seconds is short enough that two
   genuinely distinct actions (e.g. viewing the same festival twice in one
   session) are never merged.

## Core events

### Discovery

| Event | Type | Fired from |
|---|---|---|
| Page viewed | `PAGE_VIEW` | `trackPageView()` — explore/calendar/hidden-india/destinations/festivals list pages |
| Festival viewed | `FESTIVAL_VIEW` | `/festivals/[slug]` |
| Destination viewed | `DESTINATION_VIEW` | `/destinations/[slug]` |

Experience/food views have no dedicated event — neither has a public
detail page yet (no `/experiences/[slug]` or `/food/[slug]` route exists
in this phase), so there's nothing to track a view *of*.

### Map

| Event | Type / action | Fired from |
|---|---|---|
| Map opened | `MAP_INTERACTION` `map_opened` | `MapPageClient` |
| State selected | `STATE_EXPLORATION` | `MapPageClient` |
| Marker selected | `MAP_MARKER_CLICK` | `MapPageClient` |
| Month changed | `MAP_INTERACTION` `month_selected` | `MapPageClient` |
| Layer toggled | `MAP_INTERACTION` `layer_toggled` | `MapPageClient` |
| Discovery panel → explore click | `MAP_INTERACTION` `explore_click` | `DiscoveryPreviewPanel` |

City/cluster-selected are deliberately not tracked — spec's own "do not
track every UI interaction," and a cluster click is already a zoom
action, not a distinct discovery.

### Search

| Event | Type | Fired from |
|---|---|---|
| Search opened | `SEARCH_OPENED` | `HeaderSearch` |
| Query + result count | `SEARCH_QUERY` / `SEARCH_ZERO_RESULT` | `search()` service — also writes a `SearchQueryLog` row, see below |
| Result clicked | `SEARCH_RESULT_CLICK` | `HeaderSearch`, `/search`, via `TrackedLink` |

**Note:** the header map's inline "select a search result on the map"
action also fires `SEARCH_QUERY` with a different metadata shape
(`{source:"map", kind, name}` — no `resultCount`) — a pre-existing
naming overlap from Phase 3/6, left as-is (renaming an already-shipped
event type is a bigger change than this phase's scope) but documented
here so a query against `SEARCH_QUERY` rows knows to expect two shapes.

### Calendar / Explore

Generic `CALENDAR_INTERACTION` / `EXPLORE_INTERACTION` types,
disambiguated by `metadata.action` (`"festival_clicked"`,
`"map_cta_clicked"`, `"discovery_clicked"`, `"calendar_cta"`, ...) — see
`src/app/calendar/page.tsx` and `src/app/explore/page.tsx`.

### Personalization

| Event | Type / action |
|---|---|
| Onboarding started/completed/skipped | `ONBOARDING_INTERACTION` `started`/`completed`/`skipped` |
| Preference changed | `PREFERENCE_UPDATED` |
| Recommendation viewed (deduped, see above) | `RECOMMENDATION_VIEWED` |
| Recommendation clicked | `RECOMMENDATION_CLICK` |
| Recommendation saved / added to trip | Reuses `SAVE`/`ADD_TO_TRIP` with `metadata.source` set to the rail's context — not a separate event type, since it's the same action as any other save, just from a different card. The admin dashboard's Recommendations funnel counts these by checking for a truthy `metadata.source`. |

### Account

`AUTH_INTERACTION` (`signup_started`, `signup_completed`, `login`,
`logout`) + `GUEST_MERGE` (fired once per successful guest→account merge,
with `savedCount`/`visitedCount`/`tripCount`/`hadPreferences` in
metadata).

### Saves / Visited

`SAVE` fires on **both** save and unsave, with `metadata.saved: boolean`
carrying the direction (fixed in Phase 11 — it previously fired
identically both ways with no way to tell them apart after the fact).
`VISITED` already carried `metadata.visited: boolean` since Phase 8.

### Trips

| Event | Type / action |
|---|---|
| Trip created | `TRIP_CREATED` |
| Trip opened | `TRIP_INTERACTION` `opened` (new in Phase 11; mount-once-guarded) |
| Item added | `ADD_TO_TRIP` |
| Item removed | `TRIP_INTERACTION` `item_removed` (new in Phase 11) |
| Item reordered | `TRIP_INTERACTION` `item_reordered` |
| Day changed | `TRIP_INTERACTION` `day_changed` |
| Trip duplicated / deleted | `TRIP_INTERACTION` `duplicated`/`deleted` |
| Trip shared | `TRIP_INTERACTION` `shared` (new in Phase 11 — fires when the Share button copies a link) |

## Personal data

Never sent to analytics: passwords, session/auth tokens, private trip
notes or itinerary contents beyond a `contentId` reference, raw
preference values (only a derived `budgetLevel`-style summary where it
matters), or any field not explicitly listed above. `metadata` payloads
are hand-written per call site, not a serialized dump of request/response
bodies — there is no path by which arbitrary user input reaches an
analytics row unfiltered, aside from the search query text itself (see
Content Intelligence below), which travellers already expect to be a
public product signal.

## Content Intelligence

A second table, `SearchQueryLog` (kept separate from `AnalyticsEvent` —
see the schema comment for why), records **every** meaningful search
(`normalizedQuery`, `rawQuery`, `resultCount`, identity, timestamp), not
just zero-result ones, so opportunity scoring has real volume/trend
history. `normalizeQuery()` (`src/lib/search/normalize.ts`) lowercases,
trims, and collapses whitespace/trailing punctuation — deliberately not
aggressive (no stemming, no synonym folding) so grouping stays
predictable.

**Opportunity detection** (`src/features/analytics/content-intelligence.ts`):
zero-result searches over the last 90 days, grouped by normalized query,
with fewer than 3 occurrences dropped as noise. Score:

```
score = recentSearches(last 30d) × 2 + olderSearches(31–90d) × 1
```

Documented and simple by design (spec §29: "do not use an opaque AI
score") — every row here is already zero-result by construction, so the
only real signal left to rank on is volume, weighted toward recency.
`/admin/analytics`'s Content Opportunities table surfaces this with
per-row actions: search existing festivals/destinations for a near-match,
jump straight to creating one, or **dismiss** — which hides the
opportunity from future listings via `ContentOpportunityDismissal` without
deleting the underlying `SearchQueryLog` rows (spec §47).

## Technical Observability

Two more tables, both admin-only reads, neither an extension of the
analytics/audit tables above:

- **`ErrorLog`** (`src/lib/errors/index.ts`) — `captureError()` writes
  `message`/`stack`/`path`/`severity`, console-logs unconditionally, and
  never throws itself. Wired into `src/app/error.tsx` (route-segment
  boundary) and `src/app/global-error.tsx` (root-layout boundary, Next.js
  16's `retry`-prop convention — see `AGENTS.md`), both of which POST to
  `/api/errors/capture`.
- **`PerformanceLog`** (`src/lib/performance/index.ts`) — `measureAsync()`
  wraps a named operation, times it, and logs `durationMs` +
  success/failure unconditionally (not sampled — V1 volume is low enough
  that every call is cheap to log). Applied to the query surfaces spec
  §33–§36 name specifically: `map.viewport`, `search.query`,
  `recommendations.destinations`/`.festivals`, `nearby.festival`/
  `.destination`.
- **`GET /api/health`** — checks database connectivity via `SELECT 1`, no
  authentication required (suitable for an uptime monitor), returns 200/503
  with no internal details beyond per-check up/down.
- **`/admin/analytics`**'s System Health section surfaces recent error
  count, slow-request count (>1s, last 24h), and average search/map
  latency — admin-only, computed live from the two tables above plus the
  health check, never exposed publicly.

## Admin dashboard

`/admin/analytics` — Overview (content views/searches/saves/trips created,
each with a period-over-period comparison), one combined "Activity over
time" chart (rather than four separate small multiples — see
`ActivityLineChart`'s docstring), Discovery (top festivals/destinations by
views), Search (top queries + zero-result counts), Content Opportunities,
Recommendations (impressions/clicks/saves/added-to-trip), Trips (created,
average itinerary size, most-added content, public shares), and System
Health. Date ranges: Today / 7 days / 30 days / 90 days
(`src/features/analytics/admin-service.ts`'s `DateRangeKey`) — no custom
range picker in V1, per spec's own restraint. Every comparison shows raw
counts alongside a percentage, and the percentage itself is withheld
(shown as "vs N prior" instead of a number) whenever the prior period's
count is below 10 — spec §28's "avoid overinterpreting small numbers" (a
1→5 jump never renders as a headline "+400%").

## Data retention

Not yet automated — documented here as the intended policy for a future
phase to implement as a scheduled job:

- **`AnalyticsEvent`/`SearchQueryLog`** (product/content signal): retain
  12 months. Old enough to compare year-over-year seasonal patterns
  (this is a seasonal-travel product), short enough to bound table growth.
- **`ErrorLog`/`PerformanceLog`** (operational): retain 30 days. Nothing
  here is useful for a historical trend beyond "is this happening more
  than it used to," which a rolling 30-day window already answers.
- **`AuditLog`** (Phase 10, compliance/traceability): retain indefinitely
  — this is the "who changed what" record for published content, which
  should outlive any individual piece of content's own lifecycle.
- **`ContentOpportunityDismissal`**: retain indefinitely — a dismissal is
  a standing editorial decision ("we know about this gap, not now"), not
  a log line.

## Privacy

Admin analytics are aggregate wherever the underlying question is
aggregate by nature (top searches, content performance, funnels) — no
screen anywhere shows one visitor's individual search/browsing history,
and `/admin/analytics` (like every `/admin/*` route) is authorization-gated
the same three ways Phase 10's CMS is (route middleware, layout session
check, per-query `requireAdmin()`). A signed-in user's own saved
content/trips remain visible only to them through the ordinary account
UI, never through analytics tooling.

## Phase 12 touches

No architectural change — the three-layer design above was re-verified
intact, not revised. Two small hardening fixes: `AnalyticsEvent.userId`
gained an index it was missing (`docs/database.md`'s "Phase 12: hardening
indexes"), and `dismissContentOpportunityAction`'s `normalizedQuery`
argument gained Zod validation (`dismissedQuerySchema`) — it took a bare
`string` Server Action argument with no runtime check, one of 15 such gaps
this phase's security audit found and closed across the admin CMS (see
`docs/security.md`).
