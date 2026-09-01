import { db } from "@/lib/db";
import type { Session } from "next-auth";
import { requireAdmin } from "@/features/admin/service";

const OPPORTUNITY_WINDOW_DAYS = 90;
const RECENT_WINDOW_DAYS = 30;
/** Below this many zero-result searches in the window, a query is noise, not a signal (spec §11: "use thresholds to avoid showing one-off noise"). */
const MIN_SEARCH_COUNT = 3;

export interface ContentOpportunity {
  normalizedQuery: string;
  /** The most recent as-typed spelling — normalization is lossy (casing/whitespace), so this is what an admin should actually read. */
  sampleRawQuery: string;
  totalSearches: number;
  recentSearches: number;
  olderSearches: number;
  lastSearchedAt: Date;
  /** Documented, non-AI formula (spec §29): recent activity counts double — see calculateOpportunityScore. */
  score: number;
}

/**
 * score = recentSearches × 2 + olderSearches × 1
 *
 * Every row this aggregates is already a zero-result search by construction
 * (the caller filters `resultCount = 0`), so "zero-result rate" is trivially
 * 100% for all of them — the only remaining signal worth ranking on is
 * volume, weighted toward recency so a query that spiked last week outranks
 * one that trickled in evenly over three months. Deliberately simple and
 * fully transparent (spec §29: "do not use an opaque AI score — document
 * the formula") rather than a black-box relevance model.
 */
function calculateOpportunityScore(recentSearches: number, olderSearches: number): number {
  return recentSearches * 2 + olderSearches;
}

/** Spec §11/§12: repeated zero-result searches, thresholded, scored, and excludable per-query by an admin's prior "dismiss." */
export async function getContentOpportunities(session: Session | null): Promise<ContentOpportunity[]> {
  requireAdmin(session);

  const windowStart = new Date(Date.now() - OPPORTUNITY_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const recentStart = new Date(Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [rows, dismissals] = await Promise.all([
    db.searchQueryLog.findMany({
      where: { resultCount: 0, createdAt: { gte: windowStart } },
      select: { normalizedQuery: true, rawQuery: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    db.contentOpportunityDismissal.findMany({ select: { normalizedQuery: true } }),
  ]);

  const dismissed = new Set(dismissals.map((d) => d.normalizedQuery));

  const grouped = new Map<string, { sampleRawQuery: string; total: number; recent: number; older: number; last: Date }>();
  for (const row of rows) {
    if (dismissed.has(row.normalizedQuery)) continue;
    const existing = grouped.get(row.normalizedQuery);
    const isRecent = row.createdAt >= recentStart;
    if (existing) {
      existing.total += 1;
      if (isRecent) existing.recent += 1;
      else existing.older += 1;
      if (row.createdAt > existing.last) existing.last = row.createdAt;
    } else {
      grouped.set(row.normalizedQuery, { sampleRawQuery: row.rawQuery, total: 1, recent: isRecent ? 1 : 0, older: isRecent ? 0 : 1, last: row.createdAt });
    }
  }

  return [...grouped.entries()]
    .filter(([, v]) => v.total >= MIN_SEARCH_COUNT)
    .map(([normalizedQuery, v]) => ({
      normalizedQuery,
      sampleRawQuery: v.sampleRawQuery,
      totalSearches: v.total,
      recentSearches: v.recent,
      olderSearches: v.older,
      lastSearchedAt: v.last,
      score: calculateOpportunityScore(v.recent, v.older),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
}

/**
 * "Dismissing should not delete analytics data — it only hides the
 * opportunity from the current workflow" (spec §47). Not audit-logged:
 * `AuditLog.entityType` is scoped to actual content entities (Festival,
 * Location, ...), and a dismissal doesn't create/change one — the
 * dismissal row itself, with `dismissedByUserId` + `createdAt`, is its own
 * complete record of who hid it and when.
 */
export async function dismissContentOpportunity(session: Session | null, normalizedQuery: string): Promise<void> {
  requireAdmin(session);
  await db.contentOpportunityDismissal.upsert({
    where: { normalizedQuery },
    create: { normalizedQuery, dismissedByUserId: session.user.id },
    update: {},
  });
}

/** Top search terms overall (not just zero-result) — spec §13 "search trending," aggregate only, never per-user. */
export async function getTopSearches(days: number, limit = 15): Promise<{ query: string; count: number; zeroResultCount: number }[]> {
  const windowStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db.searchQueryLog.groupBy({
    by: ["normalizedQuery"],
    where: { createdAt: { gte: windowStart } },
    _count: { _all: true },
    orderBy: { _count: { normalizedQuery: "desc" } },
    take: limit,
  });

  const zeroCounts = await Promise.all(
    rows.map((r) => db.searchQueryLog.count({ where: { normalizedQuery: r.normalizedQuery, resultCount: 0, createdAt: { gte: windowStart } } }))
  );

  return rows.map((r, i) => ({ query: r.normalizedQuery, count: r._count._all, zeroResultCount: zeroCounts[i] }));
}
