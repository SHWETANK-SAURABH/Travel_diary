import type { ContentType, TripVisibility } from "@prisma/client";

export interface CreateTripInput {
  name: string;
  visibility?: TripVisibility;
  estimatedBudget?: number;
  days?: number;
}

export interface AddTripItemInput {
  tripId: string;
  day: number;
  order?: number;
  contentType?: ContentType;
  contentId?: string;
  locationId?: string;
  notes?: string;
}
