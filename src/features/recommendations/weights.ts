/**
 * Centrally configurable weights (spec §18/§39: "recommendation weights
 * should be centrally configurable... do not hardcode weights in multiple
 * components"). Every scoring function in `scoring.ts` imports these
 * instead of embedding numbers inline, so tuning the model later (or an
 * admin-editable weights table, a future phase) touches only this file.
 *
 * Initial values are the spec's own illustrative starting point (§18) —
 * "treat these as initial tunable values, NOT permanent truth."
 */
export interface RecommendationWeights {
  personalFit: number;
  seasonDateFit: number;
  travelQuality: number;
  uniqueness: number;
  budgetFit: number;
  festivalEventFit: number;
  popularity: number;
}

export const DEFAULT_WEIGHTS: RecommendationWeights = {
  personalFit: 0.4,
  seasonDateFit: 0.2,
  travelQuality: 0.15,
  uniqueness: 0.1,
  budgetFit: 0.05,
  festivalEventFit: 0.05,
  popularity: 0.05,
};

/**
 * `personalFit` (above) is itself a blend of these four traveller-specific
 * signals — the spec names all four as "personal fit" inputs (§15) but only
 * gives top-level weights (§18), not their internal split. Crowd preference
 * is deliberately not dominant (spec §19: "should not automatically remove
 * otherwise excellent destinations").
 */
export interface PersonalFitWeights {
  interest: number;
  travelStyle: number;
  crowd: number;
  duration: number;
}

export const DEFAULT_PERSONAL_FIT_WEIGHTS: PersonalFitWeights = {
  interest: 0.4,
  travelStyle: 0.25,
  crowd: 0.2,
  duration: 0.15,
};

/**
 * Festivals don't have a budget/cost-per-day field, so festival scoring
 * replaces `budgetFit` with `dateFit` (does the occurrence actually overlap
 * the traveller's dates/month — spec §16's "date fit / month fit") and
 * `festivalEventFit` with `destinationFit` (spec §16's own "destination
 * fit" — does this festival have a curated/nearby destination connection).
 */
export interface FestivalRecommendationWeights {
  personalFit: number;
  dateFit: number;
  travelQuality: number;
  uniqueness: number;
  destinationFit: number;
  popularity: number;
}

export const DEFAULT_FESTIVAL_WEIGHTS: FestivalRecommendationWeights = {
  personalFit: 0.4,
  dateFit: 0.25,
  travelQuality: 0.15,
  uniqueness: 0.1,
  destinationFit: 0.05,
  popularity: 0.05,
};
