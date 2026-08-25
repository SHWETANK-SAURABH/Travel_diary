import type { ContentType } from "@prisma/client";

export interface GuestSavedItem {
  contentType: ContentType;
  contentId: string;
  savedAt: string; // ISO timestamp
}

export interface GuestTripItemDraft {
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
  days?: number;
  estimatedBudget?: number;
  items: GuestTripItemDraft[];
  updatedAt: string; // ISO timestamp
}

export interface GuestState {
  savedItems: GuestSavedItem[];
  trips: GuestTripDraft[];
}
