import { db } from "@/lib/db";
import { boundingBoxWhere } from "@/lib/geo";
import { containsInsensitive } from "@/lib/search";
import { measureAsync } from "@/lib/performance";
import { listFestivalsInViewport } from "@/features/festivals/service";
import { listDestinationsInViewport } from "@/features/destinations/service";
import { getLocationIdsForState } from "@/features/locations/service";
import type { MapDiscovery, MapSearchResult, MapViewportQuery, StateSummary } from "./types";

/**
 * The map's core data call: "give me everything visible inside this
 * viewport" (see docs/architecture.md, "Geospatial architecture").
 * Deliberately server-side and bbox-scoped — the client never loads all of
 * India's content and filters in the browser. Returns a normalized,
 * lightweight shape (no descriptions/images) regardless of source table —
 * see src/features/map/types.ts.
 */
export async function getViewportContent(query: MapViewportQuery): Promise<MapDiscovery[]> {
  return measureAsync("map.viewport", () => getViewportContentImpl(query));
}

async function getViewportContentImpl(query: MapViewportQuery): Promise<MapDiscovery[]> {
  const { box, month } = query;

  const [festivals, destinations, experiences, events] = await Promise.all([
    listFestivalsInViewport(box),
    listDestinationsInViewport(box),
    db.experience.findMany({
      where: { status: "PUBLISHED", ...boundingBoxWhere(box) },
      select: { id: true, slug: true, name: true, latitude: true, longitude: true },
      take: 500,
    }),
    db.event.findMany({
      where: { location: { ...boundingBoxWhere(box) } },
      select: { id: true, name: true, date: true, location: { select: { latitude: true, longitude: true } } },
      take: 500,
    }),
  ]);

  const inSeason = month ? await filterFestivalsBySeason(festivals.map((f) => f.id), month) : null;

  const discoveries: MapDiscovery[] = [];

  for (const f of festivals) {
    if (f.latitude == null || f.longitude == null) continue;
    if (inSeason && !inSeason.has(f.id)) continue;
    discoveries.push({
      id: f.id,
      kind: "festival",
      name: f.name,
      latitude: f.latitude,
      longitude: f.longitude,
      locationPrecision: f.precision,
      slug: f.slug,
      popularity: f.popularity,
    });
  }

  for (const d of destinations) {
    if (d.latitude == null || d.longitude == null) continue;
    discoveries.push({
      id: d.id,
      kind: "destination",
      name: d.name,
      latitude: d.latitude,
      longitude: d.longitude,
      locationPrecision: d.precision,
      slug: d.slug,
      popularity: d.popularity,
    });
  }

  for (const e of experiences) {
    if (e.latitude == null || e.longitude == null) continue;
    discoveries.push({
      id: e.id,
      kind: "experience",
      name: e.name,
      latitude: e.latitude,
      longitude: e.longitude,
      locationPrecision: "APPROXIMATE",
      slug: e.slug,
      popularity: null,
    });
  }

  for (const ev of events) {
    if (ev.location?.latitude == null || ev.location?.longitude == null) continue;
    discoveries.push({
      id: ev.id,
      kind: "event",
      name: ev.name,
      latitude: ev.location.latitude,
      longitude: ev.location.longitude,
      locationPrecision: "APPROXIMATE",
      slug: null,
      popularity: null,
    });
  }

  return discoveries;
}

async function filterFestivalsBySeason(festivalIds: string[], month: number): Promise<Set<string>> {
  if (festivalIds.length === 0) return new Set();

  const occurrences = await db.festivalOccurrence.findMany({
    where: { festivalId: { in: festivalIds }, startDate: { not: null } },
    select: { festivalId: true, startDate: true },
  });

  const matches = new Set<string>();
  for (const occurrence of occurrences) {
    if (occurrence.startDate && occurrence.startDate.getUTCMonth() + 1 === month) {
      matches.add(occurrence.festivalId);
    }
  }
  return matches;
}

/**
 * Map-specific search — unlike src/features/search (universal site search),
 * every result here carries coordinates + a zoom hint so the map can fly to
 * it. Separate call site per the spec: "Do NOT replace the global search...
 * the map search should be optimized for geographic exploration."
 */
export async function mapSearch(query: string, limit = 8): Promise<MapSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const nameFilter = containsInsensitive(trimmed);

  const [states, cities, festivals, destinations] = await Promise.all([
    db.location.findMany({
      where: { type: "STATE", name: nameFilter },
      select: { id: true, slug: true, name: true, latitude: true, longitude: true },
      take: limit,
    }),
    db.location.findMany({
      where: { type: "CITY", name: nameFilter },
      select: { id: true, slug: true, name: true, latitude: true, longitude: true },
      take: limit,
    }),
    db.festival.findMany({
      where: { status: "PUBLISHED", name: nameFilter },
      select: { id: true, slug: true, name: true, latitude: true, longitude: true },
      take: limit,
    }),
    db.destination.findMany({
      where: { status: "PUBLISHED", name: nameFilter },
      select: { id: true, slug: true, name: true, latitude: true, longitude: true },
      take: limit,
    }),
  ]);

  const results: MapSearchResult[] = [];

  for (const s of states) {
    if (s.latitude == null || s.longitude == null) continue;
    results.push({ kind: "state", id: s.id, slug: s.slug, name: s.name, latitude: s.latitude, longitude: s.longitude, zoom: 6 });
  }
  for (const c of cities) {
    if (c.latitude == null || c.longitude == null) continue;
    results.push({ kind: "city", id: c.id, slug: c.slug, name: c.name, latitude: c.latitude, longitude: c.longitude, zoom: 9 });
  }
  for (const f of festivals) {
    if (f.latitude == null || f.longitude == null) continue;
    results.push({ kind: "festival", id: f.id, slug: f.slug, name: f.name, latitude: f.latitude, longitude: f.longitude, zoom: 11 });
  }
  for (const d of destinations) {
    if (d.latitude == null || d.longitude == null) continue;
    results.push({ kind: "destination", id: d.id, slug: d.slug, name: d.name, latitude: d.latitude, longitude: d.longitude, zoom: 11 });
  }

  return results.slice(0, limit);
}

/** Powers the map's state-selection panel — counts for one state, this month (or all year). */
export async function getStateSummary(stateSlug: string, month?: number): Promise<StateSummary | null> {
  const state = await db.location.findFirst({
    where: { slug: stateSlug, type: "STATE" },
    select: { id: true, slug: true, name: true },
  });
  if (!state) return null;

  // Festivals/destinations under this state, or under a city/region whose parent is this state.
  const locationIds = await getLocationIdsForState(stateSlug);

  const [festivalIds, destinationCount, hiddenDestinationCount] = await Promise.all([
    db.festival.findMany({
      where: { status: "PUBLISHED", locationId: { in: locationIds } },
      select: { id: true },
    }),
    db.destination.count({ where: { status: "PUBLISHED", locationId: { in: locationIds } } }),
    db.destination.count({
      where: { status: "PUBLISHED", locationId: { in: locationIds }, popularity: "HIDDEN" },
    }),
  ]);

  const festivalCount = month
    ? (await filterFestivalsBySeason(festivalIds.map((f) => f.id), month)).size
    : festivalIds.length;

  const hiddenFestivalCount = await db.festival.count({
    where: { status: "PUBLISHED", locationId: { in: locationIds }, popularity: "HIDDEN" },
  });

  return {
    slug: state.slug,
    name: state.name,
    festivalCount,
    destinationCount,
    hiddenCount: hiddenDestinationCount + hiddenFestivalCount,
  };
}
