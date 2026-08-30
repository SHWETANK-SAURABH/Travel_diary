import { db } from "@/lib/db";
import { boundingBoxWhere, padBoundingBox, type BoundingBox } from "@/lib/geo";
import { containsInsensitive } from "@/lib/search";
import { getLocationIdsForState } from "@/features/locations/service";
import { listDestinationsInViewport } from "@/features/destinations/service";
import { mediaFor, mediaForMany } from "@/lib/media";
import { resolveFestivalStatus, type OccurrenceLike } from "./status";
import { rankFestivals } from "./ranking";
import type { FestivalDiscoveryFilters, FestivalListFilters } from "./types";

const PUBLIC_FESTIVAL_SELECT = {
  id: true,
  slug: true,
  name: true,
  popularity: true,
  latitude: true,
  longitude: true,
  precision: true,
  category: { select: { slug: true, name: true } },
} as const;

/** DB-backed taxonomy — never hardcode category names/slugs in the UI (see docs/database.md, "Taxonomy: categories and tags are data, not code"). */
export async function listFestivalCategories() {
  return db.festivalCategory.findMany({ orderBy: { order: "asc" } });
}

export async function listPublishedFestivals(filters: FestivalListFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 24, 100);

  const stateLocationIds = filters.stateSlug ? await getLocationIdsForState(filters.stateSlug) : null;

  return db.festival.findMany({
    where: {
      status: "PUBLISHED",
      category: filters.categorySlug ? { slug: filters.categorySlug } : undefined,
      popularity: filters.popularity,
      locationId: stateLocationIds ? { in: stateLocationIds } : filters.stateLocationId,
      tags: filters.tagIds?.length ? { some: { id: { in: filters.tagIds } } } : undefined,
    },
    select: PUBLIC_FESTIVAL_SELECT,
    orderBy: { name: "asc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

/**
 * The festival discovery feed: every published festival (optionally scoped
 * to a state/category/popularity), each annotated with its most relevant
 * occurrence + computed temporal status, ranked per
 * src/features/festivals/ranking.ts. `/festivals` composes "Happening Now" /
 * "Upcoming" / "Browse by Month" sections by filtering this one list rather
 * than issuing three separate queries.
 */
export async function getFestivalDiscoveryFeed(filters: FestivalDiscoveryFilters = {}) {
  const stateLocationIds = filters.stateSlug ? await getLocationIdsForState(filters.stateSlug) : null;

  const festivals = await db.festival.findMany({
    where: {
      status: "PUBLISHED",
      category: filters.categorySlug ? { slug: filters.categorySlug } : undefined,
      popularity: filters.popularity,
      locationId: stateLocationIds ? { in: stateLocationIds } : undefined,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      popularity: true,
      featured: true,
      category: { select: { slug: true, name: true } },
      location: { select: { name: true, slug: true } },
      occurrences: {
        orderBy: { year: "desc" },
        take: 2,
        select: { startDate: true, endDate: true, dateConfidence: true, year: true },
      },
    },
  });

  const mediaByFestival = await mediaForMany(
    "FESTIVAL",
    festivals.map((f) => f.id)
  );

  const annotated = festivals.map((festival) => {
    const occurrence = pickRelevantOccurrence(festival.occurrences);
    return {
      ...festival,
      occurrence,
      status: resolveFestivalStatus(occurrence),
      imageUrl: mediaByFestival.get(festival.id)?.[0]?.url ?? null,
    };
  });

  return rankFestivals(annotated, { month: filters.month });
}

export type FestivalDiscoveryItem = Awaited<ReturnType<typeof getFestivalDiscoveryFeed>>[number];

/**
 * The two feed slices Calendar and Explore both need — filtering the same
 * ranked discovery feed rather than a second query/status model, per the
 * spec's "use the existing festival status system."
 */
export async function getHappeningNowFestivals(limit = 6) {
  const feed = await getFestivalDiscoveryFeed();
  return feed.filter((f) => f.status === "HAPPENING_NOW").slice(0, limit);
}

export async function getUpcomingFestivals(limit = 6) {
  const feed = await getFestivalDiscoveryFeed();
  return feed.filter((f) => f.status === "UPCOMING").slice(0, limit);
}

export function pickRelevantOccurrence(occurrences: OccurrenceLike[]): OccurrenceLike | null {
  if (occurrences.length === 0) return null;
  const now = new Date();

  const ongoing = occurrences.find((o) => o.startDate && o.endDate && o.startDate <= now && o.endDate >= now);
  if (ongoing) return ongoing;

  const future = occurrences.find((o) => o.startDate && o.startDate >= now);
  if (future) return future;

  return occurrences[0];
}

export async function getFestivalBySlug(slug: string) {
  return db.festival.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      tags: true,
      travellerFitTags: true,
      occurrences: { orderBy: { year: "desc" }, take: 3 },
      location: { include: { parent: true } },
      foods: { select: { id: true, slug: true, name: true, description: true, region: true } },
      experiences: { select: { id: true, slug: true, name: true, description: true, category: true } },
      destinations: { select: { id: true, slug: true, name: true, popularity: true } },
      events: { orderBy: { date: "asc" } },
    },
  });
}

/** Festival hero + gallery images, ordered — see the Media polymorphic-association note in schema.prisma. */
export async function getFestivalMedia(festivalId: string) {
  return mediaFor("FESTIVAL", festivalId);
}

/**
 * Geographic "nearby" for a festival page — other festivals and
 * destinations within ~150km, excluding the festival itself. Complements
 * (doesn't replace) the direct `festival.destinations`/`.experiences`/
 * `.foods` relations, which represent curated/host connections rather than
 * raw proximity.
 */
export async function getNearbyToFestival(festival: { id: string; latitude: number | null; longitude: number | null }, limit = 4) {
  if (festival.latitude == null || festival.longitude == null) {
    return { festivals: [], destinations: [] };
  }

  const point: BoundingBox = {
    minLat: festival.latitude,
    minLng: festival.longitude,
    maxLat: festival.latitude,
    maxLng: festival.longitude,
  };
  const box = padBoundingBox(point, 1.5); // ~150km at Indian latitudes

  const [nearbyFestivals, nearbyDestinations] = await Promise.all([
    db.festival.findMany({
      where: { status: "PUBLISHED", id: { not: festival.id }, ...boundingBoxWhere(box) },
      select: PUBLIC_FESTIVAL_SELECT,
      take: limit,
    }),
    listDestinationsInViewport(box).then((list) => list.slice(0, limit)),
  ]);

  return { festivals: nearbyFestivals, destinations: nearbyDestinations };
}

/** Powers the map's viewport query — see src/features/map for the multi-content-type version. */
export async function listFestivalsInViewport(box: BoundingBox) {
  return db.festival.findMany({
    where: { status: "PUBLISHED", ...boundingBoxWhere(box) },
    select: PUBLIC_FESTIVAL_SELECT,
    take: 500,
  });
}

export async function searchFestivalsByName(query: string, limit = 10) {
  return db.festival.findMany({
    where: { status: "PUBLISHED", name: containsInsensitive(query) },
    select: PUBLIC_FESTIVAL_SELECT,
    take: limit,
  });
}
