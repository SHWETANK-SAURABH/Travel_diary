import { db } from "@/lib/db";
import { containsInsensitive, normalizeQuery } from "@/lib/search";
import { analytics } from "@/lib/analytics";
import { measureAsync } from "@/lib/performance";
import { mediaForMany } from "@/lib/media";
import type { SearchResponse, SearchResult, SearchSuggestions } from "./types";

const RESULTS_PER_TYPE = 6;
const FUZZY_SIMILARITY_THRESHOLD = 0.25;
const FUZZY_CANDIDATE_LIMIT = 5;
const MIN_QUERY_LENGTH = 2;

/** exact > prefix > substring-elsewhere-in-name; 0 means "didn't match on name". */
function nameMatchScore(name: string, query: string): number {
  const n = name.toLowerCase();
  const q = query.toLowerCase();
  if (n === q) return 100;
  if (n.startsWith(q)) return 80;
  if (n.includes(q)) return 55;
  return 0;
}

function editorialBonus(featured: boolean | undefined, popularity: string | undefined): number {
  let bonus = 0;
  if (featured) bonus += 10;
  if (popularity === "POPULAR") bonus += 3;
  return bonus;
}

interface FestivalRow {
  id: string;
  slug: string;
  name: string;
  popularity: string;
  featured: boolean;
  category: { name: string } | null;
  location: { name: string } | null;
}

interface DestinationRow {
  id: string;
  slug: string;
  name: string;
  popularity: string;
  featured: boolean;
  budgetLevel: string | null;
  location: { name: string } | null;
}

interface ExperienceRow {
  id: string;
  slug: string;
  name: string;
  location: { name: string } | null;
}

interface FoodRow {
  id: string;
  slug: string;
  name: string;
  region: string | null;
}

interface LocationRow {
  id: string;
  slug: string;
  name: string;
  type: string;
}

interface EventRow {
  id: string;
  name: string;
  date: Date | null;
  festival: { slug: string; name: string } | null;
  destination: { slug: string; name: string } | null;
}

/**
 * Falls back to pg_trgm similarity matching for one content type when the
 * plain substring search returned nothing — the typo tolerance the spec
 * asks for ("Munnar" should still surface results for "Munaar"), built on
 * the trigram GIN indexes already added in the search_and_geo_indexes
 * migration rather than a new search engine. Returns matching ids in
 * similarity order; the caller re-selects full rows for them.
 */
async function fuzzyMatchIds(table: "Festival" | "Destination" | "Experience" | "Food", query: string): Promise<string[]> {
  const statusFilter = table === "Festival" || table === "Destination" ? `AND status = 'PUBLISHED'` : "";
  const rows = await db.$queryRawUnsafe<{ id: string }[]>(
    `SELECT id FROM "${table}" WHERE similarity(name, $1) > $2 ${statusFilter} ORDER BY similarity(name, $1) DESC LIMIT $3`,
    query,
    FUZZY_SIMILARITY_THRESHOLD,
    FUZZY_CANDIDATE_LIMIT
  );
  return rows.map((r) => r.id);
}

/**
 * Universal search across every content type the product spec calls out:
 * festivals, destinations, cities/states, experiences, food, events. Each
 * query runs as a small set of Prisma calls (name + location + tag +
 * description match, OR'd together) using the trigram indexes from the
 * search_and_geo_indexes migration — fine at V1 volume; if this becomes a
 * bottleneck, replace the body of this function with a call to an external
 * index (Meilisearch/Typesense) without changing its signature.
 *
 * Ranking is a transparent weighted tier, not alphabetical: exact/prefix/
 * substring name match ranks highest, a location-name match next, any other
 * field match (tag/description, both folded into the same OR clause) below
 * that, with a small popularity/editorial bonus layered on top — the same
 * "transparent weighted sum" philosophy as the festival/destination ranking
 * heuristics.
 */
export async function search(query: string, userId?: string, anonymousId?: string): Promise<SearchResponse> {
  return measureAsync("search.query", () => searchImpl(query, userId, anonymousId));
}

async function searchImpl(query: string, userId?: string, anonymousId?: string): Promise<SearchResponse> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return { query: trimmed, results: [], usedFuzzyMatch: false };
  }

  const nameFilter = containsInsensitive(trimmed);

  const [initialFestivals, initialDestinations, initialExperiences, initialFoods, locations, events] = await Promise.all([
    db.festival.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ name: nameFilter }, { location: { name: nameFilter } }, { tags: { some: { name: nameFilter } } }, { description: nameFilter }],
      },
      select: { id: true, slug: true, name: true, popularity: true, featured: true, category: { select: { name: true } }, location: { select: { name: true } } },
      take: 20,
    }) as Promise<FestivalRow[]>,
    db.destination.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ name: nameFilter }, { location: { name: nameFilter } }, { tags: { some: { name: nameFilter } } }, { description: nameFilter }],
      },
      select: { id: true, slug: true, name: true, popularity: true, featured: true, budgetLevel: true, location: { select: { name: true } } },
      take: 20,
    }) as Promise<DestinationRow[]>,
    db.experience.findMany({
      where: { status: "PUBLISHED", OR: [{ name: nameFilter }, { location: { name: nameFilter } }, { tags: { some: { name: nameFilter } } }, { description: nameFilter }] },
      select: { id: true, slug: true, name: true, location: { select: { name: true } } },
      take: 20,
    }) as Promise<ExperienceRow[]>,
    db.food.findMany({
      where: { status: "PUBLISHED", OR: [{ name: nameFilter }, { tags: { some: { name: nameFilter } } }, { description: nameFilter }] },
      select: { id: true, slug: true, name: true, region: true },
      take: 20,
    }) as Promise<FoodRow[]>,
    db.location.findMany({
      where: { name: nameFilter, type: { in: ["STATE", "CITY"] } },
      select: { id: true, slug: true, name: true, type: true },
      take: 10,
    }) as Promise<LocationRow[]>,
    db.event.findMany({
      where: { name: nameFilter },
      select: { id: true, name: true, date: true, festival: { select: { slug: true, name: true } }, destination: { select: { slug: true, name: true } } },
      take: 10,
    }) as Promise<EventRow[]>,
  ]);

  // Reassigned below when the typo-tolerant fallback replaces a content type's matches.
  let festivals = initialFestivals;
  let destinations = initialDestinations;
  let experiences = initialExperiences;
  let foods = initialFoods;

  const rawMatchCount = festivals.length + destinations.length + experiences.length + foods.length + locations.length + events.length;
  let usedFuzzyMatch = false;

  // Typo-tolerant fallback, per content type, only where the plain match came up empty.
  if (trimmed.length >= 3) {
    const [festivalFuzzyIds, destinationFuzzyIds, experienceFuzzyIds, foodFuzzyIds] = await Promise.all([
      festivals.length === 0 ? fuzzyMatchIds("Festival", trimmed) : Promise.resolve<string[]>([]),
      destinations.length === 0 ? fuzzyMatchIds("Destination", trimmed) : Promise.resolve<string[]>([]),
      experiences.length === 0 ? fuzzyMatchIds("Experience", trimmed) : Promise.resolve<string[]>([]),
      foods.length === 0 ? fuzzyMatchIds("Food", trimmed) : Promise.resolve<string[]>([]),
    ]);

    if (festivalFuzzyIds.length > 0) {
      const rows = (await db.festival.findMany({
        where: { id: { in: festivalFuzzyIds } },
        select: { id: true, slug: true, name: true, popularity: true, featured: true, category: { select: { name: true } }, location: { select: { name: true } } },
      })) as FestivalRow[];
      festivals = festivalFuzzyIds.map((id) => rows.find((r) => r.id === id)).filter((r): r is FestivalRow => Boolean(r));
      usedFuzzyMatch = true;
    }
    if (destinationFuzzyIds.length > 0) {
      const rows = (await db.destination.findMany({
        where: { id: { in: destinationFuzzyIds } },
        select: { id: true, slug: true, name: true, popularity: true, featured: true, budgetLevel: true, location: { select: { name: true } } },
      })) as DestinationRow[];
      destinations = destinationFuzzyIds.map((id) => rows.find((r) => r.id === id)).filter((r): r is DestinationRow => Boolean(r));
      usedFuzzyMatch = true;
    }
    if (experienceFuzzyIds.length > 0) {
      const rows = (await db.experience.findMany({
        where: { id: { in: experienceFuzzyIds }, status: "PUBLISHED" },
        select: { id: true, slug: true, name: true, location: { select: { name: true } } },
      })) as ExperienceRow[];
      experiences = experienceFuzzyIds.map((id) => rows.find((r) => r.id === id)).filter((r): r is ExperienceRow => Boolean(r));
      usedFuzzyMatch = true;
    }
    if (foodFuzzyIds.length > 0) {
      const rows = (await db.food.findMany({
        where: { id: { in: foodFuzzyIds }, status: "PUBLISHED" },
        select: { id: true, slug: true, name: true, region: true },
      })) as FoodRow[];
      foods = foodFuzzyIds.map((id) => rows.find((r) => r.id === id)).filter((r): r is FoodRow => Boolean(r));
      usedFuzzyMatch = true;
    }
  }

  const scoredFestivals = festivals
    .map((f) => ({
      row: f,
      score: Math.max(nameMatchScore(f.name, trimmed), f.location?.name.toLowerCase().includes(trimmed.toLowerCase()) ? 40 : 0, usedFuzzyMatch ? 35 : 15) + editorialBonus(f.featured, f.popularity),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, RESULTS_PER_TYPE)
    .map((s) => s.row);

  const scoredDestinations = destinations
    .map((d) => ({
      row: d,
      score: Math.max(nameMatchScore(d.name, trimmed), d.location?.name.toLowerCase().includes(trimmed.toLowerCase()) ? 40 : 0, usedFuzzyMatch ? 35 : 15) + editorialBonus(d.featured, d.popularity),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, RESULTS_PER_TYPE)
    .map((s) => s.row);

  const scoredExperiences = experiences
    .map((e) => ({ row: e, score: Math.max(nameMatchScore(e.name, trimmed), usedFuzzyMatch ? 35 : 15) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, RESULTS_PER_TYPE)
    .map((s) => s.row);

  const scoredFoods = foods
    .map((f) => ({ row: f, score: Math.max(nameMatchScore(f.name, trimmed), usedFuzzyMatch ? 35 : 15) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, RESULTS_PER_TYPE)
    .map((s) => s.row);

  const [mediaByFestival, mediaByDestination] = await Promise.all([
    mediaForMany("FESTIVAL", scoredFestivals.map((f) => f.id)),
    mediaForMany("DESTINATION", scoredDestinations.map((d) => d.id)),
  ]);

  const results: SearchResult[] = [
    ...scoredFestivals.map(
      (f): SearchResult => ({
        contentType: "FESTIVAL",
        id: f.id,
        slug: f.slug,
        name: f.name,
        href: `/festivals/${f.slug}`,
        metadata: [f.category?.name, f.location?.name].filter(Boolean).join(" · ") || null,
        imageUrl: mediaByFestival.get(f.id)?.[0]?.url ?? null,
      })
    ),
    ...scoredDestinations.map(
      (d): SearchResult => ({
        contentType: "DESTINATION",
        id: d.id,
        slug: d.slug,
        name: d.name,
        href: `/destinations/${d.slug}`,
        metadata: [d.location?.name, d.budgetLevel].filter(Boolean).join(" · ") || null,
        imageUrl: mediaByDestination.get(d.id)?.[0]?.url ?? null,
      })
    ),
    ...scoredExperiences.map(
      (e): SearchResult => ({
        contentType: "EXPERIENCE",
        id: e.id,
        slug: e.slug,
        name: e.name,
        href: null, // no public /experiences/[slug] page yet
        metadata: e.location?.name ?? null,
        imageUrl: null,
      })
    ),
    ...scoredFoods.map(
      (f): SearchResult => ({
        contentType: "FOOD",
        id: f.id,
        slug: f.slug,
        name: f.name,
        href: null, // no public /food/[slug] page yet
        metadata: f.region,
        imageUrl: null,
      })
    ),
    ...locations.slice(0, RESULTS_PER_TYPE).map(
      (l): SearchResult => ({
        contentType: "LOCATION",
        id: l.id,
        slug: l.slug,
        name: l.name,
        href: `/festivals?state=${l.slug}`,
        metadata: l.type === "STATE" ? "State" : "City",
        imageUrl: null,
      })
    ),
    ...events.slice(0, RESULTS_PER_TYPE).map((e): SearchResult => {
      const parent = e.festival ?? e.destination;
      const parentHref = e.festival ? `/festivals/${e.festival.slug}` : e.destination ? `/destinations/${e.destination.slug}` : null;
      return {
        contentType: "EVENT",
        id: e.id,
        slug: null,
        name: e.name,
        href: parentHref,
        metadata: [e.date?.toLocaleDateString("en-IN", { month: "short", day: "numeric" }), parent?.name].filter(Boolean).join(" · ") || null,
        imageUrl: null,
      };
    }),
  ];

  await Promise.all([
    analytics.track({
      type: results.length === 0 ? "SEARCH_ZERO_RESULT" : "SEARCH_QUERY",
      userId,
      metadata: { query: trimmed, resultCount: results.length, rawMatchCount, usedFuzzyMatch },
    }),
    // Content Intelligence's own log (spec §8/§9) — every meaningful search,
    // not just zero-result ones, so opportunity scoring has real volume/trend
    // history; kept separate from AnalyticsEvent so grouping by query doesn't
    // mean aggregating a JSON blob (see schema comment on SearchQueryLog).
    db.searchQueryLog.create({
      data: { normalizedQuery: normalizeQuery(trimmed), rawQuery: trimmed, resultCount: results.length, userId, anonymousId },
    }),
  ]);

  return { query: trimmed, results, usedFuzzyMatch };
}

/** Empty-state fallback content — "nothing found, but here's what's popular" rather than a blank screen. */
export async function getSearchSuggestions(): Promise<SearchSuggestions> {
  const [popularDestinations, popularFestivals] = await Promise.all([
    db.destination.findMany({
      where: { status: "PUBLISHED", OR: [{ featured: true }, { popularity: "POPULAR" }] },
      select: { id: true, slug: true, name: true },
      take: 4,
      orderBy: { featured: "desc" },
    }),
    db.festival.findMany({
      where: { status: "PUBLISHED", OR: [{ featured: true }, { popularity: "POPULAR" }] },
      select: { id: true, slug: true, name: true },
      take: 4,
      orderBy: { featured: "desc" },
    }),
  ]);

  return { popularDestinations, popularFestivals };
}
