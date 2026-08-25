import { db } from "@/lib/db";
import { listFestivalsInViewport } from "@/features/festivals/service";
import { listDestinationsInViewport } from "@/features/destinations/service";
import type { MapMarker, MapViewportQuery } from "./types";

/**
 * The map's core data call: "give me everything visible inside this
 * viewport" (see docs/architecture.md, section "Geospatial architecture").
 * Deliberately server-side and bbox-scoped — the client never loads all of
 * India's content and filters in the browser.
 */
export async function getViewportContent(query: MapViewportQuery): Promise<MapMarker[]> {
  const layers = query.layers ?? ["festivals", "destinations"];
  const markers: MapMarker[] = [];

  if (layers.includes("festivals")) {
    const festivals = await listFestivalsInViewport(query.box);
    const inSeason = query.month ? await filterFestivalsBySeason(festivals.map((f) => f.id), query.month) : null;

    for (const f of festivals) {
      if (f.latitude == null || f.longitude == null) continue;
      if (inSeason && !inSeason.has(f.id)) continue;
      markers.push({ id: f.id, contentType: "FESTIVAL", name: f.name, latitude: f.latitude, longitude: f.longitude });
    }
  }

  if (layers.includes("destinations")) {
    const destinations = await listDestinationsInViewport(query.box);
    for (const d of destinations) {
      if (d.latitude == null || d.longitude == null) continue;
      markers.push({ id: d.id, contentType: "DESTINATION", name: d.name, latitude: d.latitude, longitude: d.longitude });
    }
  }

  return markers;
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
