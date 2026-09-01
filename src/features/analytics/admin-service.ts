import { db } from "@/lib/db";
import type { Session } from "next-auth";
import { requireAdmin } from "@/features/admin/service";

export type DateRangeKey = "today" | "7d" | "30d" | "90d";

const RANGE_DAYS: Record<DateRangeKey, number> = { today: 1, "7d": 7, "30d": 30, "90d": 90 };

export interface DateRangeBounds {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
  days: number;
}

export function getRangeBounds(range: DateRangeKey): DateRangeBounds {
  const days = RANGE_DAYS[range];
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const previousEnd = start;
  const previousStart = new Date(start.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end, previousStart, previousEnd, days };
}

/**
 * A raw-count delta between two periods, always alongside both raw numbers
 * (spec §28: "avoid overinterpreting small numbers... show raw counts
 * alongside percentages"). `changePercent` is `null` (never shown as a
 * misleading number) whenever the previous period's count is below the
 * sample-size floor.
 */
export interface Comparison {
  current: number;
  previous: number;
  changePercent: number | null;
}

const MIN_SAMPLE_FOR_PERCENT = 10;

function compare(current: number, previous: number): Comparison {
  const changePercent = previous >= MIN_SAMPLE_FOR_PERCENT ? Math.round(((current - previous) / previous) * 100) : null;
  return { current, previous, changePercent };
}

async function countContentViews(start: Date, end: Date): Promise<number> {
  return db.analyticsEvent.count({ where: { type: { in: ["FESTIVAL_VIEW", "DESTINATION_VIEW"] }, createdAt: { gte: start, lt: end } } });
}

async function countSearches(start: Date, end: Date): Promise<number> {
  return db.searchQueryLog.count({ where: { createdAt: { gte: start, lt: end } } });
}

/** `metadata.saved: true` isolates the "saved" half of the SAVE event (which fires for both directions — see src/components/discovery/useSavedState.ts). */
async function countSaves(start: Date, end: Date): Promise<number> {
  return db.analyticsEvent.count({ where: { type: "SAVE", createdAt: { gte: start, lt: end }, metadata: { path: ["saved"], equals: true } } });
}

async function countTripsCreated(start: Date, end: Date): Promise<number> {
  return db.analyticsEvent.count({ where: { type: "TRIP_CREATED", createdAt: { gte: start, lt: end } } });
}

export interface AnalyticsOverview {
  contentViews: Comparison;
  searches: Comparison;
  saves: Comparison;
  tripsCreated: Comparison;
}

async function getOverview(bounds: DateRangeBounds): Promise<AnalyticsOverview> {
  const [cViews, pViews, cSearch, pSearch, cSaves, pSaves, cTrips, pTrips] = await Promise.all([
    countContentViews(bounds.start, bounds.end),
    countContentViews(bounds.previousStart, bounds.previousEnd),
    countSearches(bounds.start, bounds.end),
    countSearches(bounds.previousStart, bounds.previousEnd),
    countSaves(bounds.start, bounds.end),
    countSaves(bounds.previousStart, bounds.previousEnd),
    countTripsCreated(bounds.start, bounds.end),
    countTripsCreated(bounds.previousStart, bounds.previousEnd),
  ]);

  return {
    contentViews: compare(cViews, pViews),
    searches: compare(cSearch, pSearch),
    saves: compare(cSaves, pSaves),
    tripsCreated: compare(cTrips, pTrips),
  };
}

export interface TopContentItem {
  id: string;
  name: string;
  href: string | null;
  views: number;
}

async function getTopContent(bounds: DateRangeBounds, contentType: "FESTIVAL" | "DESTINATION", limit = 8): Promise<TopContentItem[]> {
  const eventType = contentType === "FESTIVAL" ? "FESTIVAL_VIEW" : "DESTINATION_VIEW";
  const grouped = await db.analyticsEvent.groupBy({
    by: ["contentId"],
    where: { type: eventType, createdAt: { gte: bounds.start, lt: bounds.end }, contentId: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { contentId: "desc" } },
    take: limit,
  });
  const ids = grouped.map((g) => g.contentId!).filter(Boolean);
  if (ids.length === 0) return [];

  const rows =
    contentType === "FESTIVAL"
      ? await db.festival.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, slug: true } })
      : await db.destination.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, slug: true } });
  const byId = new Map(rows.map((r) => [r.id, r]));
  const hrefBase = contentType === "FESTIVAL" ? "/festivals" : "/destinations";

  return grouped
    .map((g): TopContentItem | null => {
      const row = byId.get(g.contentId!);
      return row ? { id: row.id, name: row.name, href: `${hrefBase}/${row.slug}`, views: g._count._all } : null;
    })
    .filter((r): r is TopContentItem => r !== null);
}

export interface TopSearchRow {
  query: string;
  count: number;
  zeroResultCount: number;
}

async function getTopSearches(bounds: DateRangeBounds, limit = 10): Promise<TopSearchRow[]> {
  const grouped = await db.searchQueryLog.groupBy({
    by: ["normalizedQuery"],
    where: { createdAt: { gte: bounds.start, lt: bounds.end } },
    _count: { _all: true },
    orderBy: { _count: { normalizedQuery: "desc" } },
    take: limit,
  });
  const zeroCounts = await Promise.all(
    grouped.map((g) => db.searchQueryLog.count({ where: { normalizedQuery: g.normalizedQuery, resultCount: 0, createdAt: { gte: bounds.start, lt: bounds.end } } }))
  );
  return grouped.map((g, i) => ({ query: g.normalizedQuery, count: g._count._all, zeroResultCount: zeroCounts[i] }));
}

export interface RecommendationFunnel {
  impressions: number;
  clicks: number;
  /** SAVE/ADD_TO_TRIP events carrying a `metadata.source` — i.e. attributable to a recommendation surface, not a direct save from a detail page. */
  saves: number;
  addedToTrip: number;
}

/** "Has a `metadata.source`" is checked in JS, not a Prisma JSON-path filter — `source` is always a non-empty string when present, and Prisma's JSON null-handling semantics (DbNull/JsonNull/AnyNull) make an "is present and truthy" filter more fragile to express than to just check after a plain fetch, at this event volume. */
async function getRecommendationFunnel(bounds: DateRangeBounds): Promise<RecommendationFunnel> {
  const where = { createdAt: { gte: bounds.start, lt: bounds.end } };
  const [impressions, clicks, saveEvents, addToTripEvents] = await Promise.all([
    db.analyticsEvent.count({ where: { ...where, type: "RECOMMENDATION_VIEWED" } }),
    db.analyticsEvent.count({ where: { ...where, type: "RECOMMENDATION_CLICK" } }),
    db.analyticsEvent.findMany({ where: { ...where, type: "SAVE" }, select: { metadata: true } }),
    db.analyticsEvent.findMany({ where: { ...where, type: "ADD_TO_TRIP" }, select: { metadata: true } }),
  ]);

  const hasSource = (metadata: unknown) => typeof metadata === "object" && metadata !== null && "source" in metadata && Boolean((metadata as { source?: unknown }).source);
  return {
    impressions,
    clicks,
    saves: saveEvents.filter((e) => hasSource(e.metadata)).length,
    addedToTrip: addToTripEvents.filter((e) => hasSource(e.metadata)).length,
  };
}

export interface TripStats {
  created: number;
  averageItemCount: number;
  publicShares: number;
  topDestinations: { name: string; count: number }[];
  topFestivals: { name: string; count: number }[];
}

async function getTripStats(bounds: DateRangeBounds): Promise<TripStats> {
  const [created, shareEvents, trips, itemsByDestination, itemsByFestival] = await Promise.all([
    db.analyticsEvent.count({ where: { type: "TRIP_CREATED", createdAt: { gte: bounds.start, lt: bounds.end } } }),
    db.analyticsEvent.count({ where: { type: "TRIP_INTERACTION", createdAt: { gte: bounds.start, lt: bounds.end }, metadata: { path: ["action"], equals: "shared" } } }),
    db.trip.findMany({ where: { createdAt: { gte: bounds.start, lt: bounds.end } }, select: { _count: { select: { items: true } } } }),
    db.tripItem.groupBy({ by: ["contentId"], where: { contentType: "DESTINATION", trip: { createdAt: { gte: bounds.start, lt: bounds.end } } }, _count: { _all: true }, orderBy: { _count: { contentId: "desc" } }, take: 5 }),
    db.tripItem.groupBy({ by: ["contentId"], where: { contentType: "FESTIVAL", trip: { createdAt: { gte: bounds.start, lt: bounds.end } } }, _count: { _all: true }, orderBy: { _count: { contentId: "desc" } }, take: 5 }),
  ]);

  const averageItemCount = trips.length > 0 ? Math.round((trips.reduce((sum, t) => sum + t._count.items, 0) / trips.length) * 10) / 10 : 0;

  const [destinationRows, festivalRows] = await Promise.all([
    db.destination.findMany({ where: { id: { in: itemsByDestination.map((i) => i.contentId!).filter(Boolean) } }, select: { id: true, name: true } }),
    db.festival.findMany({ where: { id: { in: itemsByFestival.map((i) => i.contentId!).filter(Boolean) } }, select: { id: true, name: true } }),
  ]);
  const destNameById = new Map(destinationRows.map((d) => [d.id, d.name]));
  const festNameById = new Map(festivalRows.map((f) => [f.id, f.name]));

  return {
    created,
    averageItemCount,
    publicShares: shareEvents,
    topDestinations: itemsByDestination.map((i) => ({ name: destNameById.get(i.contentId!) ?? "Unknown", count: i._count._all })).filter((r) => r.name !== "Unknown"),
    topFestivals: itemsByFestival.map((i) => ({ name: festNameById.get(i.contentId!) ?? "Unknown", count: i._count._all })).filter((r) => r.name !== "Unknown"),
  };
}

export interface ActivityPoint {
  date: string; // yyyy-mm-dd
  views: number;
  searches: number;
  saves: number;
  trips: number;
}

/** Daily buckets for the "Activity over time" chart — bucketed in JS rather than a raw SQL date_trunc, since V1 event volume is small enough that this is simpler and just as correct. */
async function getActivityOverTime(bounds: DateRangeBounds): Promise<ActivityPoint[]> {
  const [viewEvents, searchLogs, saveEvents, tripEvents] = await Promise.all([
    db.analyticsEvent.findMany({ where: { type: { in: ["FESTIVAL_VIEW", "DESTINATION_VIEW"] }, createdAt: { gte: bounds.start, lt: bounds.end } }, select: { createdAt: true } }),
    db.searchQueryLog.findMany({ where: { createdAt: { gte: bounds.start, lt: bounds.end } }, select: { createdAt: true } }),
    db.analyticsEvent.findMany({ where: { type: "SAVE", createdAt: { gte: bounds.start, lt: bounds.end }, metadata: { path: ["saved"], equals: true } }, select: { createdAt: true } }),
    db.analyticsEvent.findMany({ where: { type: "TRIP_CREATED", createdAt: { gte: bounds.start, lt: bounds.end } }, select: { createdAt: true } }),
  ]);

  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const buckets = new Map<string, ActivityPoint>();
  const dayCount = Math.max(1, Math.ceil((bounds.end.getTime() - bounds.start.getTime()) / (24 * 60 * 60 * 1000)));
  for (let i = 0; i < dayCount; i++) {
    const key = dayKey(new Date(bounds.start.getTime() + i * 24 * 60 * 60 * 1000));
    buckets.set(key, { date: key, views: 0, searches: 0, saves: 0, trips: 0 });
  }

  const bump = (rows: { createdAt: Date }[], field: keyof Omit<ActivityPoint, "date">) => {
    for (const row of rows) {
      const key = dayKey(row.createdAt);
      const bucket = buckets.get(key);
      if (bucket) bucket[field] += 1;
    }
  };
  bump(viewEvents, "views");
  bump(searchLogs, "searches");
  bump(saveEvents, "saves");
  bump(tripEvents, "trips");

  return [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export interface SystemHealth {
  database: "healthy" | "unhealthy";
  recentErrorCount: number;
  slowRequestCount: number;
  avgSearchLatencyMs: number | null;
  avgMapLatencyMs: number | null;
}

async function getSystemHealth(): Promise<SystemHealth> {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const slowThresholdMs = 1000;

  let database: "healthy" | "unhealthy" = "healthy";
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    database = "unhealthy";
  }

  const [recentErrorCount, slowRequestCount, searchTimings, mapTimings] = await Promise.all([
    db.errorLog.count({ where: { createdAt: { gte: last24h } } }),
    db.performanceLog.count({ where: { createdAt: { gte: last24h }, durationMs: { gte: slowThresholdMs } } }),
    db.performanceLog.aggregate({ where: { operation: "search.query", createdAt: { gte: last24h } }, _avg: { durationMs: true } }),
    db.performanceLog.aggregate({ where: { operation: "map.viewport", createdAt: { gte: last24h } }, _avg: { durationMs: true } }),
  ]);

  return {
    database,
    recentErrorCount,
    slowRequestCount,
    avgSearchLatencyMs: searchTimings._avg.durationMs != null ? Math.round(searchTimings._avg.durationMs) : null,
    avgMapLatencyMs: mapTimings._avg.durationMs != null ? Math.round(mapTimings._avg.durationMs) : null,
  };
}

export interface AdminAnalyticsData {
  bounds: DateRangeBounds;
  overview: AnalyticsOverview;
  topFestivals: TopContentItem[];
  topDestinations: TopContentItem[];
  topSearches: TopSearchRow[];
  recommendations: RecommendationFunnel;
  trips: TripStats;
  activity: ActivityPoint[];
  health: SystemHealth;
}

/** The one call `/admin/analytics` makes — every section's data in parallel. */
export async function getAdminAnalytics(session: Session | null, range: DateRangeKey): Promise<AdminAnalyticsData> {
  requireAdmin(session);
  const bounds = getRangeBounds(range);

  const [overview, topFestivals, topDestinations, topSearches, recommendations, trips, activity, health] = await Promise.all([
    getOverview(bounds),
    getTopContent(bounds, "FESTIVAL"),
    getTopContent(bounds, "DESTINATION"),
    getTopSearches(bounds),
    getRecommendationFunnel(bounds),
    getTripStats(bounds),
    getActivityOverTime(bounds),
    getSystemHealth(),
  ]);

  return { bounds, overview, topFestivals, topDestinations, topSearches, recommendations, trips, activity, health };
}
