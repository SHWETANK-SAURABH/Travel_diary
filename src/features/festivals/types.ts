import type { Festival, FestivalCategory, FestivalOccurrence, Tag } from "@prisma/client";

/**
 * Public-facing festival shape. Deliberately omits verification/source
 * fields (verificationSource, lastVerifiedAt) — those are internal CMS
 * metadata per the product spec and stay server-side/admin-only.
 */
export type FestivalSummary = Pick<
  Festival,
  "id" | "slug" | "name" | "popularity" | "latitude" | "longitude"
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
  stateLocationId?: string;
  tagIds?: string[];
  page?: number;
  pageSize?: number;
}
