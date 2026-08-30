import type { BudgetLevel, TravelStyle } from "@prisma/client";

/**
 * Adapted from the spec's conceptual `RecommendationContext` shape to what
 * this codebase actually has: `userPreferences` flattened onto the object
 * (mirrors `UserPreference`), `discoveryContext`/`selectedLocation` as
 * `month`/`stateSlug` (the same shared-discovery-context shape Phase 6
 * introduced), `contentType` implicit in which service function is called
 * (`recommendDestinations` vs `recommendFestivals`) rather than a
 * discriminated field.
 */
export interface RecommendationContext {
  interestTagIds?: string[];
  travelStyle?: TravelStyle;
  budgetAmount?: number;
  budgetLevel?: BudgetLevel;
  durationDays?: number;
  travellerCount?: number;
  /** 0 (busy & lively) .. 100 (quiet & peaceful). */
  crowdPreference?: number;
  travelDateStart?: Date;
  travelDateEnd?: Date;
  /** 1-12 — falls back to the current month when travel dates aren't set. */
  month?: number;
  /** Scopes candidates to a state, e.g. from Phase 6's discovery context. */
  stateSlug?: string;
  /** Excluded from results — used by recommendNearby so a detail page doesn't recommend itself. */
  excludeId?: string;
  /**
   * The signed-in viewer, if any — used only to look up their visited
   * content and mildly deprioritize it (spec §35: "avoid repeatedly
   * recommending items visited... do not completely exclude saved items
   * automatically"). Never trusted from client input; callers always set
   * this from the server-side session, not a request body.
   */
  userId?: string;
}

export interface RecommendationSignals {
  season: number;
  budget: number;
  duration: number;
  interest: number;
  travelStyle: number;
  crowd: number;
  festival: number;
  quality: number;
  uniqueness: number;
  popularity: number;
}

export interface Recommendation<T> {
  item: T;
  /** 0..1 overall score — 0 for the (unscored) anonymous fallback path. */
  score: number;
  /** Null when this is the anonymous/cold-start fallback — never a fabricated percentage. */
  matchPercent: number | null;
  /** 1-4 short, deterministic reasons. */
  reasons: string[];
  personalized: boolean;
}
