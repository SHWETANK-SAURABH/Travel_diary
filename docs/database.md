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
`FestivalPopularity` (`POPULAR | HIDDEN | LOCAL_EMERGING`) stayed an enum
rather than a table: it's a small, structurally fixed classification the
spec itself enumerates exhaustively, unlike categories/tags which are
explicitly meant to grow.

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

## Seed data

`prisma/seed.ts` (`npm run db:seed`) creates a small, clearly-marked demo
dataset: `isSeed: true` on every row it creates, across 9 states, 7
festivals (spanning all 5 categories and all 5 `dateConfidence` values), 5
destinations (3 famous, 2 offbeat), 2 experiences, 2 food items, 1 event,
and image placeholders. It's idempotent (upserts by slug/deterministic id),
safe to re-run, and is not — and should not be mistaken for — verified
production content.
