import type { Destination, Tag } from "@prisma/client";

export type DestinationSummary = Pick<
  Destination,
  "id" | "slug" | "name" | "budgetLevel" | "latitude" | "longitude"
>;

export type DestinationDetail = Destination & { tags: Tag[] };

export interface DestinationListFilters {
  budgetLevel?: Destination["budgetLevel"];
  stateLocationId?: string;
  tagIds?: string[];
  page?: number;
  pageSize?: number;
}
