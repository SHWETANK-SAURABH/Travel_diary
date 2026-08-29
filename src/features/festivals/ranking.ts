import type { ContentPopularity } from "@prisma/client";
import { daysUntil, resolveFestivalStatus, type OccurrenceLike } from "./status";

export interface RankableFestival {
  id: string;
  popularity: ContentPopularity;
  featured: boolean;
  occurrence: OccurrenceLike | null;
}

export interface FestivalRankingContext {
  /** 1-12, or null/undefined for "All Year" — no month-match bonus applied. */
  month?: number | null;
}

/**
 * Heuristic ranking — balances upcoming relevance, month match, popularity
 * and the hidden/local classification (as its own signal, not just an
 * inverse of popularity) and editorial featuring, per the spec's "do not
 * use popularity as the only ranking signal." This is intentionally a
 * transparent weighted sum, not a learned model — swap the body of
 * `scoreFestival` if a real recommendation engine replaces it later; call
 * sites (`rankFestivals`) don't need to change.
 */
export function scoreFestival(festival: RankableFestival, context: FestivalRankingContext = {}): number {
  let score = 0;

  if (festival.featured) score += 100;

  const status = resolveFestivalStatus(festival.occurrence);
  if (status === "HAPPENING_NOW") score += 60;
  else if (status === "UPCOMING" && festival.occurrence?.startDate) {
    const days = daysUntil(festival.occurrence.startDate);
    if (days <= 30) score += 40;
    else if (days <= 90) score += 20;
    else score += 5;
  }

  if (context.month && festival.occurrence?.startDate) {
    const occurrenceMonth = festival.occurrence.startDate.getUTCMonth() + 1;
    if (occurrenceMonth === context.month) score += 30;
  }

  switch (festival.popularity) {
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

export function rankFestivals<T extends RankableFestival>(festivals: T[], context: FestivalRankingContext = {}): T[] {
  return [...festivals].sort((a, b) => scoreFestival(b, context) - scoreFestival(a, context));
}
