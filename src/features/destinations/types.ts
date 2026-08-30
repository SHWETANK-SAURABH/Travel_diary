import type { Destination, DestinationCategory, Tag } from "@prisma/client";

export type DestinationSummary = Pick<
  Destination,
  "id" | "slug" | "name" | "popularity" | "budgetLevel" | "latitude" | "longitude" | "precision"
>;

export type DestinationDetail = Destination & { tags: Tag[]; category: DestinationCategory | null };

export interface DestinationListFilters {
  budgetLevel?: Destination["budgetLevel"];
  popularity?: Destination["popularity"];
  categorySlug?: string;
  /** Exact Location id (e.g. a specific city). */
  stateLocationId?: string;
  /** A STATE Location's slug — matches that state and every city/region under it. */
  stateSlug?: string;
  tagIds?: string[];
  page?: number;
  pageSize?: number;
}

export interface DestinationDiscoveryFilters {
  categorySlug?: string;
  popularity?: Destination["popularity"];
  stateSlug?: string;
  /** 1-12 — used as a ranking signal (seasonal suitability), not a hard query filter. */
  month?: number | null;
}
