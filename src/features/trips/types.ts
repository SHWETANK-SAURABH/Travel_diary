import type { ContentType, TripVisibility } from "@prisma/client";

export interface CreateTripInput {
  name: string;
  startDate?: Date;
  endDate?: Date;
  days?: number;
  travellerCount?: number;
  estimatedBudget?: number;
  locationId?: string;
  visibility?: TripVisibility;
}

export type UpdateTripInput = Partial<CreateTripInput>;

export interface AddTripItemInput {
  tripId: string;
  day: number;
  contentType?: ContentType;
  contentId?: string;
  locationId?: string;
  notes?: string;
}

export interface TripBudgetEstimate {
  low: number;
  high: number;
  /** False when no item in the trip has cost data to estimate from — the caller should hide the estimate rather than show ₹0. */
  hasData: boolean;
}

export type FestivalConflictStatus = "NONE" | "CONFIRMED_CONFLICT" | "UNCERTAIN" | "NO_TRIP_DATES";

export interface FestivalConflict {
  tripItemId: string;
  festivalName: string;
  status: FestivalConflictStatus;
}

/** "Near your plans" (spec §29/§32) suggestion — only ever destinations/festivals, the two content types with their own coordinates to anchor a proximity search. */
export interface TripSuggestionItem {
  id: string;
  slug: string;
  name: string;
  kind: "destination" | "festival";
}

export interface TripInsights {
  budget: TripBudgetEstimate;
  conflicts: FestivalConflict[];
  suggestions: TripSuggestionItem[];
}
