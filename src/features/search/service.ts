import { db } from "@/lib/db";
import { containsInsensitive } from "@/lib/search";
import { analytics } from "@/lib/analytics";
import type { SearchResponse, SearchResult } from "./types";

const RESULTS_PER_TYPE = 6;

/**
 * Universal search across every content type the product spec calls out:
 * festivals, destinations, cities/states, experiences, food. Each query
 * currently runs as a separate Prisma call using the trigram indexes from
 * the search_and_geo_indexes migration — fine at V1 volume; if this becomes
 * a bottleneck, replace the body of this function with a call to an
 * external index (Meilisearch/Typesense) without changing its signature.
 */
export async function search(query: string, userId?: string): Promise<SearchResponse> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { query: trimmed, results: [] };
  }

  const nameFilter = containsInsensitive(trimmed);

  const [festivals, destinations, experiences, foods, locations] = await Promise.all([
    db.festival.findMany({
      where: { status: "PUBLISHED", name: nameFilter },
      select: { id: true, slug: true, name: true },
      take: RESULTS_PER_TYPE,
    }),
    db.destination.findMany({
      where: { status: "PUBLISHED", name: nameFilter },
      select: { id: true, slug: true, name: true },
      take: RESULTS_PER_TYPE,
    }),
    db.experience.findMany({
      where: { name: nameFilter },
      select: { id: true, slug: true, name: true },
      take: RESULTS_PER_TYPE,
    }),
    db.food.findMany({
      where: { name: nameFilter },
      select: { id: true, slug: true, name: true },
      take: RESULTS_PER_TYPE,
    }),
    db.location.findMany({
      where: { name: nameFilter, type: { in: ["STATE", "CITY"] } },
      select: { id: true, slug: true, name: true },
      take: RESULTS_PER_TYPE,
    }),
  ]);

  const results: SearchResult[] = [
    ...festivals.map((f) => ({ ...f, contentType: "FESTIVAL" as const })),
    ...destinations.map((d) => ({ ...d, contentType: "DESTINATION" as const })),
    ...experiences.map((e) => ({ ...e, contentType: "EXPERIENCE" as const })),
    ...foods.map((f) => ({ ...f, contentType: "FOOD" as const })),
    ...locations.map((l) => ({ ...l, contentType: "LOCATION" as const })),
  ];

  await analytics.track({
    type: results.length === 0 ? "SEARCH_ZERO_RESULT" : "SEARCH_QUERY",
    userId,
    metadata: { query: trimmed, resultCount: results.length },
  });

  return { query: trimmed, results };
}
