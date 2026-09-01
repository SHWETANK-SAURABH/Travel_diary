import { db } from "@/lib/db";
import { boundingBoxWhere, padBoundingBox, type BoundingBox } from "@/lib/geo";
import { containsInsensitive } from "@/lib/search";
import { measureAsync } from "@/lib/performance";
import { getLocationIdsForState } from "@/features/locations/service";
import { mediaFor, mediaForMany } from "@/lib/media";
import { rankDestinations } from "./ranking";
import type { DestinationDiscoveryFilters, DestinationListFilters } from "./types";

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

/** DB-backed taxonomy — never hardcode destination types in the UI. */
export async function listDestinationCategories() {
  return db.destinationCategory.findMany({ orderBy: { order: "asc" } });
}

export async function listPublishedDestinations(filters: DestinationListFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 24, 100);

  const stateLocationIds = filters.stateSlug ? await getLocationIdsForState(filters.stateSlug) : null;

  return db.destination.findMany({
    where: {
      status: "PUBLISHED",
      budgetLevel: filters.budgetLevel,
      popularity: filters.popularity,
      category: filters.categorySlug ? { slug: filters.categorySlug } : undefined,
      locationId: stateLocationIds ? { in: stateLocationIds } : filters.stateLocationId,
      tags: filters.tagIds?.length ? { some: { id: { in: filters.tagIds } } } : undefined,
    },
    select: PUBLIC_DESTINATION_SELECT,
    orderBy: { name: "asc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

/**
 * The destination discovery feed: every published destination, annotated
 * with its category + a "has a curated festival connection" flag (a
 * ranking proxy for "festivals/events nearby"), ranked per
 * src/features/destinations/ranking.ts. `/destinations` composes its
 * Featured/Best This Month/Hidden India/Popular sections by filtering this
 * one ranked list, the same pattern `/festivals` uses.
 */
export async function getDestinationDiscoveryFeed(filters: DestinationDiscoveryFilters = {}) {
  const stateLocationIds = filters.stateSlug ? await getLocationIdsForState(filters.stateSlug) : null;

  const destinations = await db.destination.findMany({
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
      budgetLevel: true,
      bestTimeStartMonth: true,
      bestTimeEndMonth: true,
      category: { select: { slug: true, name: true } },
      location: { select: { name: true, slug: true } },
      _count: { select: { festivals: true } },
    },
  });

  const mediaByDestination = await mediaForMany(
    "DESTINATION",
    destinations.map((d) => d.id)
  );

  const annotated = destinations.map((destination) => ({
    ...destination,
    hasFestivalConnection: destination._count.festivals > 0,
    imageUrl: mediaByDestination.get(destination.id)?.[0]?.url ?? null,
  }));

  return rankDestinations(annotated, { month: filters.month });
}

export type DestinationDiscoveryItem = Awaited<ReturnType<typeof getDestinationDiscoveryFeed>>[number];

export async function getDestinationBySlug(slug: string) {
  return db.destination.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      tags: true,
      location: { include: { parent: true } },
      foods: { where: { status: "PUBLISHED" }, select: { id: true, slug: true, name: true, description: true, region: true } },
      experiences: { where: { status: "PUBLISHED" }, select: { id: true, slug: true, name: true, description: true, category: true } },
      festivals: {
        where: { status: "PUBLISHED" },
        select: { id: true, slug: true, name: true, popularity: true, category: { select: { name: true } } },
      },
    },
  });
}

/** Destination hero + gallery images — see the Media polymorphic-association note in schema.prisma. */
export async function getDestinationMedia(destinationId: string) {
  return mediaFor("DESTINATION", destinationId);
}

/** Geographic "nearby" for a destination page — other destinations within ~150km, excluding itself. */
export async function getNearbyToDestination(destination: { id: string; latitude: number | null; longitude: number | null }, limit = 4) {
  return measureAsync("nearby.destination", () => getNearbyToDestinationImpl(destination, limit));
}

async function getNearbyToDestinationImpl(destination: { id: string; latitude: number | null; longitude: number | null }, limit = 4) {
  if (destination.latitude == null || destination.longitude == null) return [];

  const point: BoundingBox = {
    minLat: destination.latitude,
    minLng: destination.longitude,
    maxLat: destination.latitude,
    maxLng: destination.longitude,
  };
  const box = padBoundingBox(point, 1.5); // ~150km at Indian latitudes

  const nearby = await db.destination.findMany({
    where: { status: "PUBLISHED", id: { not: destination.id }, ...boundingBoxWhere(box) },
    select: PUBLIC_DESTINATION_SELECT,
    take: limit,
  });
  return nearby;
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
