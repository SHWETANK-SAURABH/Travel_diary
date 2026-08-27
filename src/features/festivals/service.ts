import { db } from "@/lib/db";
import { boundingBoxWhere, type BoundingBox } from "@/lib/geo";
import { containsInsensitive } from "@/lib/search";
import { getLocationIdsForState } from "@/features/locations/service";
import type { FestivalListFilters } from "./types";

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

export async function getFestivalBySlug(slug: string) {
  return db.festival.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      tags: true,
      travellerFitTags: true,
      occurrences: { orderBy: { year: "desc" }, take: 3 },
      location: true,
    },
  });
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
