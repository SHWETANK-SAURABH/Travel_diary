import type { BudgetLevel, CrowdPreference, TravelStyle } from "@prisma/client";

/** Signals the future recommendation engine scores candidates against. */
export interface RecommendationContext {
  budgetLevel?: BudgetLevel;
  durationDays?: number;
  travellerCount?: number;
  travelStyle?: TravelStyle;
  crowdPreference?: CrowdPreference;
  interestTagIds?: string[];
  /** 1-12, for matching against destination best-time windows and festival occurrences. */
  travelMonth?: number;
}

export interface ScoredCandidate<T> {
  item: T;
  score: number;
  /** Human-readable reasons, surfaced as "why this matches" per the product spec. */
  reasons: string[];
}
