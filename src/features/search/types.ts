import type { ContentType } from "@prisma/client";

export type SearchResultType = ContentType | "LOCATION";

export interface SearchResult {
  contentType: SearchResultType;
  id: string;
  /** Present for every type except EVENT (no public detail page yet). */
  slug: string | null;
  name: string;
  /** Precomputed destination href — null renders as plain text, not a dead link. */
  href: string | null;
  /** e.g. a festival's category, a destination's location, an event's date. */
  metadata: string | null;
  imageUrl: string | null;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  /** True when the plain-text match found nothing and a typo-tolerant (pg_trgm) fallback was used instead. */
  usedFuzzyMatch: boolean;
}

export interface SearchSuggestions {
  popularDestinations: { id: string; slug: string; name: string }[];
  popularFestivals: { id: string; slug: string; name: string }[];
}
