# Database

PostgreSQL + PostGIS, managed with Prisma 6. Full schema: [`prisma/schema.prisma`](../prisma/schema.prisma).

## Entity relationship overview

```
Location (self-referencing: COUNTRY > STATE > REGION > CITY)
  ├── Festival[]        (locationId — required)
  ├── Destination[]      (locationId — required)
  ├── Experience[]        (locationId — required)
  ├── Food[]                (locationId — optional)
  ├── Event[]                 (locationId — optional)
  └── TripItem[]                (locationId — optional)

FestivalCategory (taxonomy, admin-editable)
  └── Festival[]

Tag (taxonomy: category = INTEREST | TRAVELLER_FIT | GENERAL)
  ├── Festival[]           (m2m — general tags)
  ├── Festival[]           (m2m — travellerFitTags, separate relation)
  ├── Destination[]        (m2m)
  ├── Experience[]         (m2m)
  ├── Food[]                (m2m)
  └── UserPreference[]        (m2m — interests)

Festival
  ├── FestivalCategory (required)
  ├── Location (required)
  ├── FestivalOccurrence[]      — one row per year's dates
  ├── Event[]
  ├── Experience[]  (m2m)
  ├── Food[]        (m2m)
  └── Destination[] (m2m)

Destination
  ├── Location (required)
  ├── Experience[] (m2m)
  ├── Food[]       (m2m)
  ├── Festival[]   (m2m, inverse of Festival.destinations)
  └── Event[]

User
  ├── Account[] / Session[]   (Auth.js)
  ├── UserPreference?          (1:1, all fields optional)
  ├── SavedContent[]
  ├── VisitedContent[]
  ├── Trip[]
  └── AnalyticsEvent[]

Trip
  └── TripItem[] (day, order, optional content reference, optional location)
```

`Media`, `SavedContent`, `VisitedContent`, and `TripItem.contentId` reference
content polymorphically via a `(contentType: ContentType, contentId: String)`
pair rather than a Prisma relation — see "Polymorphic content references"
below.

## Why a single `Location` table

The spec's hierarchy (`India > State/UT > Region > City`) could have been
four separate tables. Instead it's one self-referencing table with a `type`
enum and nullable `parentId`. That means:

- Adding a fifth level (e.g. a neighbourhood under City) never needs a
  migration.
- Every content model has exactly one `locationId` FK shape to deal with,
  regardless of which level it points at.
- The trade-off: the database can't enforce "a Festival's location must be
  a CITY, not a STATE" — that's a service-layer/seed-data discipline, not a
  constraint. Acceptable for V1; revisit with a check constraint or
  generated column if bad data becomes a real problem.

## Approximate vs precise locations

Every point-bearing model (`Location`, `Festival`, `Destination`) has a
`precision: LocationPrecision` field (`EXACT | APPROXIMATE`) alongside its
coordinates. The UI is expected to visually soften markers where
`precision = APPROXIMATE` rather than plotting them as if they were exact —
this is a Phase 2+ (map) concern, but the data is here now.

## Geospatial columns

Alongside `latitude`/`longitude` (`Float?`, cheap Prisma-native bbox
queries), `Location`/`Festival`/`Destination` also carry an
`Unsupported("geography(...)")` PostGIS column (`geo`), backed by a GIST
index. Prisma can't read/write `Unsupported` columns directly — they're
populated/queried via raw SQL, see `src/lib/geo/distance.ts`
(`syncGeoPoint`, `findNearby`). Two representations of the same point exist
on purpose: the Float columns are what 95% of queries (map viewport loads)
should use; the PostGIS column is for the minority that need a true radius
or polygon query.

## Festival dates: `Festival` vs `FestivalOccurrence`

`Festival` is the evergreen, one-per-festival public page (`/festivals/hornbill-festival`
never changes). Year-specific scheduling lives in `FestivalOccurrence`
(`festivalId` + `year`, unique together), with a `dateConfidence` enum
covering the full range the spec calls for:

```
NOT_ANNOUNCED → AI_SUGGESTED → EXPECTED → CONFIRMED → ADMIN_VERIFIED
```

`verifiedByUserId` + `verifiedAt` record who/when an admin promoted a date
to verified — see `verifyFestivalOccurrence()` in
`src/features/admin/service.ts` for the write path. Historical (past-year)
occurrences are stored but nothing in Phase 1 builds a public archive UI
over them, per the spec.

## Editorial featuring and transport/accommodation guidance (Phase 4)

`Festival.featured: Boolean` — a manual admin flag distinct from
`popularity` (which describes the festival itself, not "should we promote
it right now"). Backs the ranking heuristic in
`src/features/festivals/ranking.ts`; the spec names "editorial featuring"
as a ranking signal in three separate phases, and there was no field for
it before this one.

`Location.{nearestAirport, nearestRailwayStation, roadAccessNotes,
localTransportNotes, accommodationNotes}` — all optional, kept at
city/region `Location` level rather than duplicated per festival or
destination, since everything in the same city shares the same airport,
station and hotel guidance. Sections built on these fields
(`/festivals/[slug]`'s "How to Reach"/"Where to Stay") hide themselves
entirely when the fields are empty, per the spec's "do not display an
empty section."

## Destination taxonomy and featured flag (Phase 5)

`DestinationCategory` mirrors `FestivalCategory` — a DB-backed "type"
taxonomy (Nature, Heritage, Beach, Mountain, Cultural, City) rather than a
hardcoded enum, per the spec's "do not hardcode these categories... use an
extensible taxonomy." It deliberately **excludes** "Hidden gem" and "Major
destination" from the spec's example type list: those describe how
well-known a place is, which `Destination.popularity` already models —
adding them as categories too would be a second, redundant classification
for the same concept. `Destination.categoryId` is nullable (unlike
`Festival.categoryId`, which is required) since it was added after real
destination rows already existed, and a hard backfill wasn't worth forcing.

`Destination.featured: Boolean` — same rationale as `Festival.featured`
(added in Phase 4): a manual editorial signal distinct from `popularity`,
feeding `src/features/destinations/ranking.ts`.

## Destination best-time

`bestTimeStartMonth`/`bestTimeEndMonth` (+ `altTime*` for a secondary
window) are plain `Int?` (1–12) rather than a separate table — simple
enough that a table would be premature. `bestTimeSource:
VerificationStatus` tracks whether the window is system-suggested,
admin-verified, or admin-overridden, matching the spec's "hybrid" best-time
engine requirement.

## Taxonomy: categories and tags are data, not code

`FestivalCategory` and `Tag` are ordinary tables, seeded with the initial
values from the spec (5 categories, 10 interest tags, 3 traveller-fit tags)
but editable without a deploy. Nothing in `src/features` or `src/app`
hardcodes a category or tag name — they're always looked up by slug/id.
`ContentPopularity` (`POPULAR | HIDDEN | LOCAL_EMERGING`) stayed an enum
rather than a table: it's a small, structurally fixed classification the
spec itself enumerates exhaustively, unlike categories/tags which are
explicitly meant to grow. Originally `FestivalPopularity`/festival-only;
renamed and extended to `Destination.popularity` in Phase 3 (migration
`20260827202945_destination_popularity`) once the map's "Hidden Gems" layer
needed the same classification for destinations, not just festivals — the
enum values didn't change, so this was a rename-in-place, not a
drop/recreate (see the migration SQL for how that's done safely).

## Polymorphic content references

`Media.contentId`, `SavedContent.contentId`, `VisitedContent.contentId`, and
`TripItem.contentId` all pair with a `contentType: ContentType` enum
(`FESTIVAL | DESTINATION | EXPERIENCE | FOOD | EVENT`) instead of a Prisma
relation. This is deliberate, not an oversight: a single foreign-key column
cannot validly reference four different target tables at the database
level (a real FK constraint would require the same id to exist in *all*
four tables simultaneously). The alternative — one nullable FK column per
content type on `Media` — was rejected as it would need a new column (and a
migration) every time a new content type is added.

**Consequence**: referential integrity across that boundary is enforced in
the service layer (`src/lib/media/queries.ts`, `src/features/users/service.ts`),
not by a database constraint. A bad `contentId` would not be caught by
Postgres. If this becomes a real data-quality problem, the standard fix is
a periodic integrity-check job, not a schema change.

## Saved vs Visited content

Both are simple `(userId, contentType, contentId)` unique-constrained rows
with a `createdAt` — existence *is* the saved/visited state. Per the spec,
V1 deliberately has no visit dates, notes, or ratings on `VisitedContent`.

## Verification fields

`verificationStatus` (`UNVERIFIED | AI_GENERATED | ADMIN_VERIFIED |
ADMIN_OVERRIDDEN`) appears on `Festival` and `Destination`; `Destination`
additionally has `bestTimeSource` for the best-time-specific case.
`FestivalOccurrence.dateConfidence` is its date-specific equivalent. None of
the public queries in `src/features/{festivals,destinations}/service.ts`
select these fields into the public DTOs (`FestivalSummary`,
`DestinationSummary`) — they're available to admin code, not surfaced to
the public API/UI, per the spec's "should not be prominently exposed to
public users."

## Indexes

- B-tree indexes on every FK, on `status`/`popularity`/`budgetLevel` filter
  fields, and on `[latitude, longitude]` composites for bbox queries.
- GIN trigram indexes (`pg_trgm`) on `name` for
  Festival/Destination/Experience/Food/Location, added in the
  `search_and_geo_indexes` migration — powers `ILIKE`-based search without
  a full scan.
- GIST indexes on the PostGIS `geo` columns, same migration — powers
  `ST_DWithin` radius queries.
- `pg_trgm`'s `similarity()` function (same extension/indexes as above)
  additionally backs the universal search's typo-tolerant fallback — see
  `fuzzyMatchIds()` in `src/features/search/service.ts`.

## Analytics event types (Phase 6 additions)

`AnalyticsEventType` gained `SEARCH_OPENED`, `SEARCH_RESULT_CLICK`,
`CALENDAR_INTERACTION`, and `EXPLORE_INTERACTION` (migration
`20260830140000_search_calendar_explore_analytics`) for the Phase 6 search/
calendar/explore analytics requirements. `CALENDAR_INTERACTION` and
`EXPLORE_INTERACTION` are each one generic type disambiguated by
`metadata.action` (`"month_selected"`, `"map_cta_clicked"`,
`"festival_clicked"`, `"discovery_clicked"`, ...) rather than a dedicated
enum value per action — the same shape `MAP_INTERACTION` already used.

## Preference model changes (Phase 7)

`UserPreference` gained real personalization fields (migration
`20260831090000_personalization_preferences`):

- **`travelStyle: TravelStyle`** — the enum was **replaced**, not extended.
  Phase 1's placeholder values (`RELAXED | ADVENTURE | CULTURAL | OFFBEAT |
  MIXED`) were a guess with no spec backing them; Phase 7's spec explicitly
  names the onboarding UI's real options (`BACKPACKER | BUDGET | COMFORTABLE
  | LUXURY`), which the UI now presents verbatim. Since `UserPreference` had
  zero rows at the time (nothing had ever written this field), the migration
  drops and recreates the type rather than value-by-value renaming.
- **`crowdPreference: Int?`** (0–100) — replaced the 3-value
  `CrowdPreference` enum (`PREFER_CROWDED | PREFER_QUIET | NO_PREFERENCE`)
  with a continuous slider value, per the spec's explicit "store it in a way
  that can be used numerically by the ranking engine." Same zero-rows
  safety as `travelStyle`.
- **`budgetAmount: Int?`** — new. A numeric total-trip budget in INR,
  alongside the existing `budgetLevel: BudgetLevel?` (`BUDGET | MID_RANGE |
  LUXURY`) bucket. The onboarding UI's 4 presets (₹10K–20K / ₹20K–40K /
  ₹40K–75K / ₹75K+) collapse into the 3 `BudgetLevel` values via
  `deriveBudgetLevel()` (`src/lib/preferences/budget.ts`) whenever
  `budgetAmount` is written, so the two fields never drift out of sync —
  `budgetLevel` is what the recommendation engine compares directly against
  `Destination.budgetLevel`; `budgetAmount` is what it compares against
  `Destination.approximateCostPerDay × tripDays` for a real numeric budget
  fit, not just a bucket match.

`deriveBudgetLevel()` lives in `src/lib`, not `src/features/users`,
specifically so both `src/features/users/service.ts` (the authenticated
preference upsert) and `src/lib/guest/merge.ts` (the guest-to-account
preference merge) can import it without `lib` depending back on `features`.

## Analytics event types (Phase 6/7 additions)

`AnalyticsEventType` gained `SEARCH_OPENED`, `SEARCH_RESULT_CLICK`,
`CALENDAR_INTERACTION`, and `EXPLORE_INTERACTION` in Phase 6 (migration
`20260830140000_search_calendar_explore_analytics`), then
`ONBOARDING_INTERACTION`, `PREFERENCE_UPDATED`, and `RECOMMENDATION_VIEWED`
in Phase 7 (migration `20260831090000_personalization_preferences`).
`CALENDAR_INTERACTION`, `EXPLORE_INTERACTION`, and `ONBOARDING_INTERACTION`
are each one generic type disambiguated by `metadata.action`
(`"month_selected"`, `"map_cta_clicked"`, `"festival_clicked"`,
`"discovery_clicked"`, `"started"`, `"completed"`, `"skipped"`, ...) rather
than a dedicated enum value per action — the same shape `MAP_INTERACTION`
already used. Recommendation saves/add-to-trip deliberately reuse the
existing `SAVE`/`ADD_TO_TRIP` types (with `metadata.source` distinguishing
where the action happened) rather than adding `RECOMMENDATION_SAVED`/
`RECOMMENDATION_ADDED_TO_TRIP` variants — the same action on the same
content, just from a different card.

## Seed data

`prisma/seed.ts` (`npm run db:seed`) creates a small, clearly-marked demo
dataset: `isSeed: true` on every row it creates, across 9 states, 7
festivals (spanning all 5 categories and all 5 `dateConfidence` values), 5
destinations (3 famous, 2 offbeat), 2 experiences, 2 food items, 1 event,
and image placeholders. It's idempotent (upserts by slug/deterministic id),
safe to re-run, and is not — and should not be mistaken for — verified
production content.
