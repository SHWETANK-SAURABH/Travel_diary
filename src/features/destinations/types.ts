import type { Destination, Tag } from "@prisma/client";

export type DestinationSummary = Pick<
  Destination,
  "id" | "slug" | "name" | "popularity" | "budgetLevel" | "latitude" | "longitude" | "precision"
>;

export type DestinationDetail = Destination & { tags: Tag[] };

export interface DestinationListFilters {
  budgetLevel?: Destination["budgetLevel"];
  popularity?: Destination["popularity"];
  /** Exact Location id (e.g. a specific city). */
  stateLocationId?: string;
  /** A STATE Location's slug — matches that state and every city/region under it. */
  stateSlug?: string;
  tagIds?: string[];
  page?: number;
  pageSize?: number;
}
