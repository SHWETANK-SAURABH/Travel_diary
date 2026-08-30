import type { BudgetLevel, ContentPopularity, TravelStyle } from "@prisma/client";
import { isMonthInRange } from "@/lib/date/month-range";
import { resolveFestivalStatus, type OccurrenceLike } from "@/features/festivals/status";
import { DEFAULT_FESTIVAL_WEIGHTS, DEFAULT_PERSONAL_FIT_WEIGHTS, DEFAULT_WEIGHTS } from "./weights";
import type { RecommendationContext, RecommendationSignals } from "./types";

export interface DestinationCandidate {
  tagIds: string[];
  budgetLevel: BudgetLevel | null;
  approximateCostPerDay: number | null;
  bestTimeStartMonth: number | null;
  bestTimeEndMonth: number | null;
  popularity: ContentPopularity;
  featured: boolean;
  hasFestivalConnection: boolean;
}

export interface FestivalCandidate {
  tagIds: string[];
  popularity: ContentPopularity;
  featured: boolean;
  occurrence: OccurrenceLike | null;
  hasDestinationConnection: boolean;
}

/**
 * Whether `context` carries any real traveller-specific signal at all. When
 * it doesn't (a first-time guest, an anonymous visitor), the service layer
 * skips this scorer entirely and falls back to the existing anonymous
 * ranking (Phase 5/6) — spec §24/§45: never show a fabricated match score
 * for someone the system knows nothing about.
 */
export function hasPersonalizationSignal(context: RecommendationContext): boolean {
  return Boolean(
    context.interestTagIds?.length ||
      context.travelStyle ||
      context.budgetAmount != null ||
      context.durationDays != null ||
      context.crowdPreference != null
  );
}

const TRAVEL_STYLE_BUDGET_AFFINITY: Record<TravelStyle, BudgetLevel> = {
  BACKPACKER: "BUDGET",
  BUDGET: "BUDGET",
  COMFORTABLE: "MID_RANGE",
  LUXURY: "LUXURY",
};

function interestFitScore(candidateTagIds: string[], contextTagIds?: string[]): number {
  if (!contextTagIds?.length) return 0.5; // no stated interests — neutral, not penalized
  if (!candidateTagIds.length) return 0.3;
  const overlap = candidateTagIds.filter((id) => contextTagIds.includes(id)).length;
  return Math.min(1, overlap / Math.min(3, contextTagIds.length));
}

function travelStyleFitScore(budgetLevel: BudgetLevel | null, travelStyle?: TravelStyle): number {
  if (!travelStyle || !budgetLevel) return 0.5;
  return TRAVEL_STYLE_BUDGET_AFFINITY[travelStyle] === budgetLevel ? 1 : 0.4;
}

/**
 * Crowd preference is deliberately capped so it can never fully sink an
 * otherwise-excellent match (spec §19: "should not automatically disappear")
 * — floors at 0.5 (a "moderate effect", not a veto) using `popularity` as a
 * crowdiness proxy on the same 0-100 scale the slider stores.
 */
function crowdFitScore(popularity: ContentPopularity, crowdPreference?: number): number {
  if (crowdPreference == null) return 0.5;
  const candidateCrowdiness = popularity === "POPULAR" ? 20 : popularity === "LOCAL_EMERGING" ? 55 : 85;
  const diff = Math.abs(candidateCrowdiness - crowdPreference);
  return Math.max(0.5, 1 - diff / 200);
}

/**
 * No "typical visit length" field exists per destination, so this is a
 * deliberately coarse heuristic (documented, not hidden): more available
 * days is never a worse fit, very short trips are a mild constraint.
 */
function durationFitScore(durationDays?: number): number {
  if (durationDays == null) return 0.5;
  if (durationDays <= 2) return 0.55;
  if (durationDays >= 8) return 1;
  return 0.8;
}

function seasonFitScore(bestStart: number | null, bestEnd: number | null, month?: number): number {
  if (!month || bestStart == null || bestEnd == null) return 0.5;
  return isMonthInRange(month, bestStart, bestEnd) ? 1 : 0.3;
}

function budgetFitScore(approximateCostPerDay: number | null, context: RecommendationContext): number {
  if (!context.budgetAmount || !approximateCostPerDay) return 0.5;
  const days = context.durationDays ?? 5;
  const ratio = (approximateCostPerDay * days) / context.budgetAmount;
  if (ratio <= 1) return 1;
  if (ratio <= 1.3) return 0.6;
  if (ratio <= 1.8) return 0.3;
  return 0.1;
}

function qualityScore(featured: boolean, popularity: ContentPopularity): number {
  if (featured) return 1;
  return popularity === "POPULAR" ? 0.7 : 0.55;
}

function uniquenessScore(popularity: ContentPopularity): number {
  if (popularity === "HIDDEN") return 1;
  if (popularity === "LOCAL_EMERGING") return 0.75;
  return 0.35;
}

function popularityScore(popularity: ContentPopularity): number {
  if (popularity === "POPULAR") return 1;
  if (popularity === "LOCAL_EMERGING") return 0.5;
  return 0.2;
}

export interface ScoreResult {
  score: number;
  signals: RecommendationSignals;
}

/** Transparent weighted sum, not a black box — see docs/architecture.md for the full model writeup. */
export function scoreDestination(candidate: DestinationCandidate, context: RecommendationContext): ScoreResult {
  const signals: RecommendationSignals = {
    interest: interestFitScore(candidate.tagIds, context.interestTagIds),
    travelStyle: travelStyleFitScore(candidate.budgetLevel, context.travelStyle),
    crowd: crowdFitScore(candidate.popularity, context.crowdPreference),
    duration: durationFitScore(context.durationDays),
    season: seasonFitScore(candidate.bestTimeStartMonth, candidate.bestTimeEndMonth, context.month),
    budget: budgetFitScore(candidate.approximateCostPerDay, context),
    festival: candidate.hasFestivalConnection ? 1 : 0.3,
    quality: qualityScore(candidate.featured, candidate.popularity),
    uniqueness: uniquenessScore(candidate.popularity),
    popularity: popularityScore(candidate.popularity),
  };

  const personalFit =
    signals.interest * DEFAULT_PERSONAL_FIT_WEIGHTS.interest +
    signals.travelStyle * DEFAULT_PERSONAL_FIT_WEIGHTS.travelStyle +
    signals.crowd * DEFAULT_PERSONAL_FIT_WEIGHTS.crowd +
    signals.duration * DEFAULT_PERSONAL_FIT_WEIGHTS.duration;

  const score =
    personalFit * DEFAULT_WEIGHTS.personalFit +
    signals.season * DEFAULT_WEIGHTS.seasonDateFit +
    signals.quality * DEFAULT_WEIGHTS.travelQuality +
    signals.uniqueness * DEFAULT_WEIGHTS.uniqueness +
    signals.budget * DEFAULT_WEIGHTS.budgetFit +
    signals.festival * DEFAULT_WEIGHTS.festivalEventFit +
    signals.popularity * DEFAULT_WEIGHTS.popularity;

  return { score, signals };
}

export function scoreFestival(candidate: FestivalCandidate, context: RecommendationContext): ScoreResult {
  const status = resolveFestivalStatus(candidate.occurrence);
  const month = context.month ?? (context.travelDateStart ? context.travelDateStart.getUTCMonth() + 1 : undefined);
  const occurrenceMonth = candidate.occurrence?.startDate ? candidate.occurrence.startDate.getUTCMonth() + 1 : undefined;

  let dateFit = 0.5;
  if (candidate.occurrence?.startDate && context.travelDateStart && context.travelDateEnd) {
    const overlaps =
      candidate.occurrence.startDate <= context.travelDateEnd &&
      (candidate.occurrence.endDate ?? candidate.occurrence.startDate) >= context.travelDateStart;
    dateFit = overlaps ? 1 : 0.2;
  } else if (month && occurrenceMonth) {
    dateFit = occurrenceMonth === month ? 1 : 0.3;
  } else if (status === "NOT_ANNOUNCED") {
    dateFit = 0.4; // never pretend an unannounced date is confirmed to fit
  }

  const signals: RecommendationSignals = {
    interest: interestFitScore(candidate.tagIds, context.interestTagIds),
    travelStyle: 0.5, // festivals don't carry a budgetLevel to compare travel style against
    crowd: crowdFitScore(candidate.popularity, context.crowdPreference),
    duration: 0.5,
    season: dateFit,
    budget: 0.5,
    festival: candidate.hasDestinationConnection ? 1 : 0.3,
    quality: qualityScore(candidate.featured, candidate.popularity),
    uniqueness: uniquenessScore(candidate.popularity),
    popularity: popularityScore(candidate.popularity),
  };

  const personalFit =
    signals.interest * DEFAULT_PERSONAL_FIT_WEIGHTS.interest +
    signals.travelStyle * DEFAULT_PERSONAL_FIT_WEIGHTS.travelStyle +
    signals.crowd * DEFAULT_PERSONAL_FIT_WEIGHTS.crowd +
    0.5 * DEFAULT_PERSONAL_FIT_WEIGHTS.duration; // no meaningful duration signal for a festival

  const score =
    personalFit * DEFAULT_FESTIVAL_WEIGHTS.personalFit +
    signals.season * DEFAULT_FESTIVAL_WEIGHTS.dateFit +
    signals.quality * DEFAULT_FESTIVAL_WEIGHTS.travelQuality +
    signals.uniqueness * DEFAULT_FESTIVAL_WEIGHTS.uniqueness +
    signals.festival * DEFAULT_FESTIVAL_WEIGHTS.destinationFit +
    signals.popularity * DEFAULT_FESTIVAL_WEIGHTS.popularity;

  return { score, signals };
}
