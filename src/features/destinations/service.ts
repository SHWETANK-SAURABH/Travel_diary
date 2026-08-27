import { db } from "@/lib/db";
import { boundingBoxWhere, type BoundingBox } from "@/lib/geo";
import { containsInsensitive } from "@/lib/search";
import { getLocationIdsForState } from "@/features/locations/service";
import type { DestinationListFilters } from "./types";

const PUBLIC_DESTINATION_SELECT = {
  id: true,
  slug: true,
  name: true,
  popularity: true,
  budgetLevel: true,
  latitude: true,
  longitude: true,
  precision: true,
} as const;

export async function listPublishedDestinations(filters: DestinationListFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 24, 100);

  const stateLocationIds = filters.stateSlug ? await getLocationIdsForState(filters.stateSlug) : null;

  return db.destination.findMany({
    where: {
      status: "PUBLISHED",
      budgetLevel: filters.budgetLevel,
      popularity: filters.popularity,
      locationId: stateLocationIds ? { in: stateLocationIds } : filters.stateLocationId,
      tags: filters.tagIds?.length ? { some: { id: { in: filters.tagIds } } } : undefined,
    },
    select: PUBLIC_DESTINATION_SELECT,
    orderBy: { name: "asc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

export async function getDestinationBySlug(slug: string) {
  return db.destination.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { tags: true, location: true },
  });
}

export async function listDestinationsInViewport(box: BoundingBox) {
  return db.destination.findMany({
    where: { status: "PUBLISHED", ...boundingBoxWhere(box) },
    select: PUBLIC_DESTINATION_SELECT,
    take: 500,
  });
}

export async function searchDestinationsByName(query: string, limit = 10) {
  return db.destination.findMany({
    where: { status: "PUBLISHED", name: containsInsensitive(query) },
    select: PUBLIC_DESTINATION_SELECT,
    take: limit,
  });
}
