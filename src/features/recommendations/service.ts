import { db } from "@/lib/db";
import { scoreCandidate, type RecommendationContext, type ScoredCandidate } from "@/lib/recommendations";
import type { Destination } from "@prisma/client";

const CANDIDATE_POOL_SIZE = 100;
const TOP_N = 5;

/**
 * Returns the top 5 destination recommendations for a traveller context,
 * each with human-readable reasons — matching the product spec's
 * "Top 5 recommendations, and explain why each result matches". The scoring
 * itself (src/lib/recommendations/scoring.ts) is intentionally minimal; this
 * function is the stable call site the future recommendation UI will use.
 */
export async function getTopDestinationRecommendations(
  context: RecommendationContext
): Promise<ScoredCandidate<Destination>[]> {
  const candidates = await db.destination.findMany({
    where: { status: "PUBLISHED" },
    include: { tags: true },
    take: CANDIDATE_POOL_SIZE,
  });

  const scored = candidates.map((candidate) => {
    const { score, reasons } = scoreCandidate(
      {
        budgetLevel: candidate.budgetLevel,
        tagIds: candidate.tags.map((t) => t.id),
        bestTimeStartMonth: candidate.bestTimeStartMonth,
        bestTimeEndMonth: candidate.bestTimeEndMonth,
      },
      context
    );
    return { item: candidate, score, reasons };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N);
}
