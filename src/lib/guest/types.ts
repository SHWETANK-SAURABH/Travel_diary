import type { ContentType } from "@prisma/client";

export interface GuestSavedItem {
  contentType: ContentType;
  contentId: string;
  savedAt: string; // ISO timestamp
}

export interface GuestVisitedItem {
  contentType: ContentType;
  contentId: string;
  visitedAt: string; // ISO timestamp
}

export interface GuestTripItemDraft {
  /** Client-generated id — stable identity for remove/reorder/move-day, independent of array position. */
  id: string;
  day: number;
  order: number;
  contentType?: ContentType;
  contentId?: string;
  notes?: string;
}

export interface GuestTripDraft {
  /** Client-generated id (e.g. crypto.randomUUID()) — replaced by a real Trip.id once synced. */
  localId: string;
  name: string;
  startDate?: string; // ISO date
  endDate?: string;
  days?: number;
  travellerCount?: number;
  estimatedBudget?: number;
  items: GuestTripItemDraft[];
  updatedAt: string; // ISO timestamp
}

export type GuestTravelStyle = "BACKPACKER" | "BUDGET" | "COMFORTABLE" | "LUXURY";

/** Mirrors UpdatePreferenceInput, JSON-safe (dates as ISO strings) for localStorage. */
export interface GuestPreferences {
  travelDateStart?: string;
  travelDateEnd?: string;
  durationDays?: number;
  travellerCount?: number;
  /** Numeric total trip budget in INR. */
  budgetAmount?: number;
  travelStyle?: GuestTravelStyle;
  /** 0 (busy & lively) .. 100 (quiet & peaceful). */
  crowdPreference?: number;
  interestTagIds?: string[];
  updatedAt: string; // ISO timestamp
}

export interface GuestState {
  savedItems: GuestSavedItem[];
  visitedItems: GuestVisitedItem[];
  trips: GuestTripDraft[];
  preferences: GuestPreferences | null;
}
