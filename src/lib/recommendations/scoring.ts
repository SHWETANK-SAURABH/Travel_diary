import { isMonthInRange } from "@/lib/date/month-range";
import type { RecommendationContext } from "./types";

export interface ScorableFields {
  budgetLevel?: string | null;
  tagIds?: string[];
  bestTimeStartMonth?: number | null;
  bestTimeEndMonth?: number | null;
}

const WEIGHTS = {
  budgetMatch: 2,
  interestOverlapPerTag: 1,
  seasonMatch: 2,
} as const;

/**
 * Minimal weighted scorer — the real recommendation engine (uniqueness,
 * travel-quality, crowd modelling, festival/event proximity) is Phase 2+
 * work. This exists so `src/features/recommendations` has a real, testable
 * function to call rather than an empty stub, and so the scoring signals
 * declared in {@link RecommendationContext} are exercised end-to-end.
 */
export function scoreCandidate(candidate: ScorableFields, context: RecommendationContext) {
  let score = 0;
  const reasons: string[] = [];

  if (context.budgetLevel && candidate.budgetLevel === context.budgetLevel) {
    score += WEIGHTS.budgetMatch;
    reasons.push("Matches your budget");
  }

  if (context.interestTagIds?.length && candidate.tagIds?.length) {
    const overlap = candidate.tagIds.filter((id) => context.interestTagIds!.includes(id));
    if (overlap.length > 0) {
      score += overlap.length * WEIGHTS.interestOverlapPerTag;
      reasons.push(`Matches ${overlap.length} of your interests`);
    }
  }

  if (
    context.travelMonth &&
    candidate.bestTimeStartMonth != null &&
    candidate.bestTimeEndMonth != null &&
    isMonthInRange(context.travelMonth, candidate.bestTimeStartMonth, candidate.bestTimeEndMonth)
  ) {
    score += WEIGHTS.seasonMatch;
    reasons.push("Great time of year to visit");
  }

  return { score, reasons };
}
