import type { Festival, FestivalCategory, FestivalOccurrence, Tag } from "@prisma/client";

/**
 * Public-facing festival shape. Deliberately omits verification/source
 * fields (verificationSource, lastVerifiedAt) — those are internal CMS
 * metadata per the product spec and stay server-side/admin-only.
 */
export type FestivalSummary = Pick<
  Festival,
  "id" | "slug" | "name" | "popularity" | "latitude" | "longitude" | "precision"
> & {
  category: Pick<FestivalCategory, "slug" | "name">;
};

export type FestivalDetail = Festival & {
  category: FestivalCategory;
  tags: Tag[];
  travellerFitTags: Tag[];
  occurrences: FestivalOccurrence[];
};

export interface FestivalListFilters {
  categorySlug?: string;
  popularity?: Festival["popularity"];
  /** Exact Location id (e.g. a specific city). */
  stateLocationId?: string;
  /** A STATE Location's slug — matches that state and every city/region under it. */
  stateSlug?: string;
  tagIds?: string[];
  page?: number;
  pageSize?: number;
}

export interface FestivalDiscoveryFilters {
  categorySlug?: string;
  popularity?: Festival["popularity"];
  stateSlug?: string;
  /** 1-12 — used as a ranking signal (and by the "Browse by Month" UI filter), not a hard query filter. */
  month?: number | null;
}
