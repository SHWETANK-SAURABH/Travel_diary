import type { BudgetLevel, ContentType, TravelStyle } from "@prisma/client";

/** A resolved Saved/VisitedContent row — see resolveContentRecords() in service.ts. `href`/`slug` are null for content types with no public detail page yet (Experience, Food, Event). */
export interface ResolvedContentItem {
  contentType: ContentType;
  id: string;
  name: string;
  slug: string | null;
  href: string | null;
  locationName: string | null;
  imageUrl: string | null;
}

export interface UpdatePreferenceInput {
  travelDateStart?: Date;
  travelDateEnd?: Date;
  durationDays?: number;
  travellerCount?: number;
  /** Numeric total trip budget in INR — `budgetLevel` is derived from this, see deriveBudgetLevel(). */
  budgetAmount?: number;
  travelStyle?: TravelStyle;
  /** 0 (busy & lively) .. 100 (quiet & peaceful). */
  crowdPreference?: number;
  interestTagIds?: string[];
}

export type { BudgetLevel };
