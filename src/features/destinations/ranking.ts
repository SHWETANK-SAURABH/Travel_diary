import type { ContentPopularity } from "@prisma/client";
import { isMonthInRange } from "@/lib/date/month-range";

export interface RankableDestination {
  id: string;
  popularity: ContentPopularity;
  featured: boolean;
  bestTimeStartMonth: number | null;
  bestTimeEndMonth: number | null;
  /** Proxy for "festivals/events nearby" — whether this destination has any curated festival connection. */
  hasFestivalConnection: boolean;
}

export interface DestinationRankingContext {
  /** 1-12, or null/undefined for no seasonal preference. */
  month?: number | null;
}

/**
 * Heuristic ranking for the destination discovery feed — mirrors
 * src/features/festivals/ranking.ts's shape and balance (editorial
 * featuring > seasonal/contextual relevance > popularity, with hidden/local
 * destinations scoring comparably to popular ones rather than being
 * drowned out — see the spec's "do not use popularity as the only ranking
 * signal," which the Phase 3/4 festival ranking already applied). Not a
 * personalized/full recommendation engine — that's explicitly a later
 * phase; this only uses signals every visitor shares (month, editorial
 * flags), not an individual's budget/interests/travel style.
 */
export function scoreDestination(destination: RankableDestination, context: DestinationRankingContext = {}): number {
  let score = 0;

  if (destination.featured) score += 100;

  if (
    context.month &&
    destination.bestTimeStartMonth != null &&
    destination.bestTimeEndMonth != null &&
    isMonthInRange(context.month, destination.bestTimeStartMonth, destination.bestTimeEndMonth)
  ) {
    score += 40; // seasonal suitability
  }

  if (destination.hasFestivalConnection) score += 15; // "festivals/events nearby"

  switch (destination.popularity) {
    case "POPULAR":
      score += 15;
      break;
    case "LOCAL_EMERGING":
      score += 18; // 8 base + 10 hidden/local diversity boost
      break;
    case "HIDDEN":
      score += 15; // 5 base + 10 hidden/local diversity boost
      break;
  }

  return score;
}

export function rankDestinations<T extends RankableDestination>(
  destinations: T[],
  context: DestinationRankingContext = {}
): T[] {
  return [...destinations].sort((a, b) => scoreDestination(b, context) - scoreDestination(a, context));
}
