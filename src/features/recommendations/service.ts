import { db } from "@/lib/db";
import { padBoundingBox, type BoundingBox } from "@/lib/geo";
import { measureAsync } from "@/lib/performance";
import { getLocationIdsForState } from "@/features/locations/service";
import { getDestinationDiscoveryFeed, getNearbyToDestination } from "@/features/destinations/service";
import { isInSeason } from "@/features/destinations/seasonal";
import { getFestivalDiscoveryFeed, getNearbyToFestival, listFestivalsInViewport } from "@/features/festivals/service";
import { resolveFestivalStatus, type OccurrenceLike } from "@/features/festivals/status";
import { mediaForMany } from "@/lib/media";
import { hasPersonalizationSignal, scoreDestination, scoreFestival, type DestinationCandidate, type FestivalCandidate } from "./scoring";
import { explainDestination, explainFestival } from "./explain";
import { selectDiverse } from "./diversity";
import type { Recommendation, RecommendationContext } from "./types";

export interface DestinationRecommendationItem {
  id: string;
  slug: string;
  name: string;
  location: { name: string };
  imageUrl: string | null;
  popularity: string;
  budgetLevel: string | null;
  categoryKey: string | null;
  geoKey: string | null;
}

export interface FestivalRecommendationItem {
  id: string;
  slug: string;
  name: string;
  location: { name: string };
  imageUrl: string | null;
  popularity: string;
  categoryKey: string | null;
  geoKey: string | null;
  status: ReturnType<typeof resolveFestivalStatus>;
}

const DESTINATION_PERSONALIZED_SELECT = {
  id: true,
  slug: true,
  name: true,
  popularity: true,
  featured: true,
  budgetLevel: true,
  approximateCostPerDay: true,
  bestTimeStartMonth: true,
  bestTimeEndMonth: true,
  categoryId: true,
  location: { select: { name: true, id: true, parentId: true, type: true } },
  tags: { select: { id: true } },
  _count: { select: { festivals: true } },
} as const;

function geoKeyFor(location: { id: string; parentId: string | null; type: string }): string | null {
  return location.type === "STATE" ? location.id : location.parentId;
}

/** A mild, non-exclusionary penalty applied when a candidate is already marked visited (spec §35: "avoid repeatedly recommending... do not completely exclude"). */
const VISITED_PENALTY = 0.6;

async function getVisitedContentIds(userId: string | undefined, contentType: "FESTIVAL" | "DESTINATION"): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await db.visitedContent.findMany({ where: { userId, contentType }, select: { contentId: true } });
  return new Set(rows.map((r) => r.contentId));
}

function anonymousDestinationReasons(d: { featured: boolean; popularity: string }, inSeason: boolean): string[] {
  const reasons: string[] = [];
  if (d.featured) reasons.push("Editor's pick");
  if (inSeason) reasons.push("Great time of year to visit");
  if (d.popularity === "HIDDEN" || d.popularity === "LOCAL_EMERGING") reasons.push("A hidden gem, off the usual path");
  else if (d.popularity === "POPULAR") reasons.push("A traveller favourite");
  if (reasons.length === 0) reasons.push("Worth exploring");
  return reasons.slice(0, 3);
}

/**
 * Top-5 destination recommendations (spec §20). Two paths, both reusing
 * Phase 5/6 infrastructure rather than a second ranking system:
 *  - No personalization signal at all → wraps the existing anonymous
 *    seasonal discovery feed (already ranked) with honest, signal-based
 *    reasons and no match percentage (spec §24/§45).
 *  - Real preference signals present → scores every published destination
 *    against them (scoreDestination), attaches deterministic explanations,
 *    and picks a diverse top N (selectDiverse).
 */
export async function recommendDestinations(
  context: RecommendationContext,
  limit = 5
): Promise<{ recommendations: Recommendation<DestinationRecommendationItem>[]; personalized: boolean }> {
  return measureAsync("recommendations.destinations", () => recommendDestinationsImpl(context, limit));
}

async function recommendDestinationsImpl(
  context: RecommendationContext,
  limit = 5
): Promise<{ recommendations: Recommendation<DestinationRecommendationItem>[]; personalized: boolean }> {
  if (!hasPersonalizationSignal(context)) {
    const feed = await getDestinationDiscoveryFeed({ month: context.month, stateSlug: context.stateSlug });
    const pool = feed.filter((d) => d.id !== context.excludeId).slice(0, limit * 4);

    const extra = await db.destination.findMany({
      where: { id: { in: pool.map((d) => d.id) } },
      select: { id: true, categoryId: true, location: { select: { id: true, parentId: true, type: true } } },
    });
    const extraById = new Map(extra.map((e) => [e.id, e]));

    const wrapped: Recommendation<DestinationRecommendationItem>[] = pool.map((d) => {
      const meta = extraById.get(d.id);
      return {
        item: {
          id: d.id,
          slug: d.slug,
          name: d.name,
          location: d.location,
          imageUrl: d.imageUrl,
          popularity: d.popularity,
          budgetLevel: d.budgetLevel,
          categoryKey: meta?.categoryId ?? null,
          geoKey: meta ? geoKeyFor(meta.location) : null,
        },
        score: 0,
        matchPercent: null,
        reasons: anonymousDestinationReasons(d, context.month ? isInSeason(d, context.month) : false),
        personalized: false,
      };
    });

    return { recommendations: selectDiverse(wrapped, limit), personalized: false };
  }

  const stateLocationIds = context.stateSlug ? await getLocationIdsForState(context.stateSlug) : null;
  const candidates = await db.destination.findMany({
    where: {
      status: "PUBLISHED",
      id: context.excludeId ? { not: context.excludeId } : undefined,
      locationId: stateLocationIds ? { in: stateLocationIds } : undefined,
    },
    select: DESTINATION_PERSONALIZED_SELECT,
  });

  const [media, visitedIds] = await Promise.all([
    mediaForMany(
      "DESTINATION",
      candidates.map((c) => c.id)
    ),
    getVisitedContentIds(context.userId, "DESTINATION"),
  ]);

  const scored: Recommendation<DestinationRecommendationItem>[] = candidates.map((c) => {
    const dto: DestinationCandidate = {
      tagIds: c.tags.map((t) => t.id),
      budgetLevel: c.budgetLevel,
      approximateCostPerDay: c.approximateCostPerDay,
      bestTimeStartMonth: c.bestTimeStartMonth,
      bestTimeEndMonth: c.bestTimeEndMonth,
      popularity: c.popularity,
      featured: c.featured,
      hasFestivalConnection: c._count.festivals > 0,
    };
    const { score: rawScore, signals } = scoreDestination(dto, context);
    const score = visitedIds.has(c.id) ? rawScore * VISITED_PENALTY : rawScore;
    return {
      item: {
        id: c.id,
        slug: c.slug,
        name: c.name,
        location: { name: c.location.name },
        imageUrl: media.get(c.id)?.[0]?.url ?? null,
        popularity: c.popularity,
        budgetLevel: c.budgetLevel,
        categoryKey: c.categoryId,
        geoKey: geoKeyFor(c.location),
      },
      score,
      matchPercent: Math.round(score * 100),
      reasons: explainDestination(signals, context, c.featured),
      personalized: true,
    };
  });

  return { recommendations: selectDiverse(scored, limit), personalized: true };
}

const FESTIVAL_PERSONALIZED_SELECT = {
  id: true,
  slug: true,
  name: true,
  popularity: true,
  featured: true,
  categoryId: true,
  location: { select: { name: true, id: true, parentId: true, type: true } },
  tags: { select: { id: true } },
  travellerFitTags: { select: { id: true } },
  occurrences: { orderBy: { year: "desc" as const }, take: 2, select: { startDate: true, endDate: true, dateConfidence: true, year: true } },
  _count: { select: { destinations: true } },
} as const;

function pickOccurrence(occurrences: OccurrenceLike[]): OccurrenceLike | null {
  const now = new Date();
  const ongoing = occurrences.find((o) => o.startDate && o.endDate && o.startDate <= now && o.endDate >= now);
  if (ongoing) return ongoing;
  const future = occurrences.find((o) => o.startDate && o.startDate >= now);
  if (future) return future;
  return occurrences[0] ?? null;
}

function anonymousFestivalReasons(f: { featured: boolean; popularity: string }): string[] {
  const reasons: string[] = [];
  if (f.featured) reasons.push("Editor's pick");
  if (f.popularity === "POPULAR") reasons.push("One of India's best-known festivals");
  else reasons.push("A distinctive local celebration");
  return reasons;
}

/** Mirrors recommendDestinations — see its docstring for the two-path shape. */
export async function recommendFestivals(
  context: RecommendationContext,
  limit = 5
): Promise<{ recommendations: Recommendation<FestivalRecommendationItem>[]; personalized: boolean }> {
  return measureAsync("recommendations.festivals", () => recommendFestivalsImpl(context, limit));
}

async function recommendFestivalsImpl(
  context: RecommendationContext,
  limit = 5
): Promise<{ recommendations: Recommendation<FestivalRecommendationItem>[]; personalized: boolean }> {
  if (!hasPersonalizationSignal(context)) {
    const feed = await getFestivalDiscoveryFeed({ month: context.month, stateSlug: context.stateSlug });
    const pool = feed.filter((f) => f.id !== context.excludeId).slice(0, limit * 4);

    const extra = await db.festival.findMany({
      where: { id: { in: pool.map((f) => f.id) } },
      select: { id: true, categoryId: true, location: { select: { id: true, parentId: true, type: true } } },
    });
    const extraById = new Map(extra.map((e) => [e.id, e]));

    const wrapped: Recommendation<FestivalRecommendationItem>[] = pool.map((f) => {
      const meta = extraById.get(f.id);
      return {
        item: {
          id: f.id,
          slug: f.slug,
          name: f.name,
          location: f.location,
          imageUrl: f.imageUrl,
          popularity: f.popularity,
          categoryKey: meta?.categoryId ?? null,
          geoKey: meta ? geoKeyFor(meta.location) : null,
          status: f.status,
        },
        score: 0,
        matchPercent: null,
        reasons: anonymousFestivalReasons(f),
        personalized: false,
      };
    });

    return { recommendations: selectDiverse(wrapped, limit), personalized: false };
  }

  const stateLocationIds = context.stateSlug ? await getLocationIdsForState(context.stateSlug) : null;
  const candidates = await db.festival.findMany({
    where: {
      status: "PUBLISHED",
      id: context.excludeId ? { not: context.excludeId } : undefined,
      locationId: stateLocationIds ? { in: stateLocationIds } : undefined,
    },
    select: FESTIVAL_PERSONALIZED_SELECT,
  });

  const [media, visitedIds] = await Promise.all([
    mediaForMany(
      "FESTIVAL",
      candidates.map((c) => c.id)
    ),
    getVisitedContentIds(context.userId, "FESTIVAL"),
  ]);

  const scored: Recommendation<FestivalRecommendationItem>[] = candidates.map((c) => {
    const occurrence = pickOccurrence(c.occurrences);
    const dto: FestivalCandidate = {
      tagIds: [...c.tags.map((t) => t.id), ...c.travellerFitTags.map((t) => t.id)],
      popularity: c.popularity,
      featured: c.featured,
      occurrence,
      hasDestinationConnection: c._count.destinations > 0,
    };
    const { score: rawScore, signals } = scoreFestival(dto, context);
    const score = visitedIds.has(c.id) ? rawScore * VISITED_PENALTY : rawScore;
    return {
      item: {
        id: c.id,
        slug: c.slug,
        name: c.name,
        location: { name: c.location.name },
        imageUrl: media.get(c.id)?.[0]?.url ?? null,
        popularity: c.popularity,
        categoryKey: c.categoryId,
        geoKey: geoKeyFor(c.location),
        status: resolveFestivalStatus(occurrence),
      },
      score,
      matchPercent: Math.round(score * 100),
      reasons: explainFestival(signals, context, c.featured),
      personalized: true,
    };
  });

  return { recommendations: selectDiverse(scored, limit), personalized: true };
}

async function nearbyFestivalsForPoint(latitude: number | null, longitude: number | null, limit: number) {
  if (latitude == null || longitude == null) return [];
  const point: BoundingBox = { minLat: latitude, minLng: longitude, maxLat: latitude, maxLng: longitude };
  const box = padBoundingBox(point, 1.5); // ~150km at Indian latitudes — matches getNearbyToFestival/getNearbyToDestination's own radius
  const festivals = await listFestivalsInViewport(box);
  return festivals.slice(0, limit);
}

/**
 * Context-aware "you're viewing X, here's what's nearby" recommendations
 * (spec §31) — deliberately built on the existing geographic nearby queries
 * (getNearbyToFestival/getNearbyToDestination, Phase 4/5) rather than a new
 * geo system. Without personalization signals this returns them in their
 * existing (proximity-ranked) order; with real preferences, the same
 * destination/festival scorer re-sorts the small nearby set and attaches
 * reasons — reusing the ranking model, not duplicating it.
 */
export async function recommendNearby(
  origin: { kind: "festival" | "destination"; id: string; latitude: number | null; longitude: number | null },
  context: RecommendationContext,
  limit = 4
): Promise<{ destinations: Recommendation<DestinationRecommendationItem>[]; festivals: Recommendation<FestivalRecommendationItem>[] }> {
  const nearby: Awaited<ReturnType<typeof getNearbyToFestival>> =
    origin.kind === "festival"
      ? await getNearbyToFestival({ id: origin.id, latitude: origin.latitude, longitude: origin.longitude }, limit)
      : {
          destinations: await getNearbyToDestination(origin, limit),
          // getNearbyToDestination only ever returns other destinations
          // (see its docstring) — festivals aren't part of its contract, so
          // fetched separately here rather than widening a Phase 5 function
          // that other call sites already depend on for a plain array.
          festivals: await nearbyFestivalsForPoint(origin.latitude, origin.longitude, limit),
        };

  if (!hasPersonalizationSignal(context) || (nearby.destinations.length === 0 && nearby.festivals.length === 0)) {
    return {
      destinations: nearby.destinations.map((d) => ({
        item: { id: d.id, slug: d.slug, name: d.name, location: { name: "" }, imageUrl: null, popularity: d.popularity, budgetLevel: null, categoryKey: null, geoKey: null },
        score: 0,
        matchPercent: null,
        reasons: ["Nearby"],
        personalized: false,
      })),
      festivals: nearby.festivals.map((f) => ({
        item: { id: f.id, slug: f.slug, name: f.name, location: { name: "" }, imageUrl: null, popularity: f.popularity, categoryKey: null, geoKey: null, status: "UPCOMING" as const },
        score: 0,
        matchPercent: null,
        reasons: ["Nearby"],
        personalized: false,
      })),
    };
  }

  const [destExtra, festExtra] = await Promise.all([
    nearby.destinations.length
      ? db.destination.findMany({ where: { id: { in: nearby.destinations.map((d) => d.id) } }, select: DESTINATION_PERSONALIZED_SELECT })
      : Promise.resolve([]),
    nearby.festivals.length
      ? db.festival.findMany({ where: { id: { in: nearby.festivals.map((f) => f.id) } }, select: FESTIVAL_PERSONALIZED_SELECT })
      : Promise.resolve([]),
  ]);

  const [destMedia, festMedia] = await Promise.all([
    mediaForMany("DESTINATION", destExtra.map((d) => d.id)),
    mediaForMany("FESTIVAL", festExtra.map((f) => f.id)),
  ]);

  const scoredDestinations = destExtra
    .map((c) => {
      const dto: DestinationCandidate = {
        tagIds: c.tags.map((t) => t.id),
        budgetLevel: c.budgetLevel,
        approximateCostPerDay: c.approximateCostPerDay,
        bestTimeStartMonth: c.bestTimeStartMonth,
        bestTimeEndMonth: c.bestTimeEndMonth,
        popularity: c.popularity,
        featured: c.featured,
        hasFestivalConnection: c._count.festivals > 0,
      };
      const { score, signals } = scoreDestination(dto, context);
      const rec: Recommendation<DestinationRecommendationItem> = {
        item: {
          id: c.id,
          slug: c.slug,
          name: c.name,
          location: { name: c.location.name },
          imageUrl: destMedia.get(c.id)?.[0]?.url ?? null,
          popularity: c.popularity,
          budgetLevel: c.budgetLevel,
          categoryKey: c.categoryId,
          geoKey: geoKeyFor(c.location),
        },
        score,
        matchPercent: Math.round(score * 100),
        reasons: explainDestination(signals, context, c.featured),
        personalized: true,
      };
      return rec;
    })
    .sort((a, b) => b.score - a.score);

  const scoredFestivals = festExtra
    .map((c) => {
      const occurrence = pickOccurrence(c.occurrences);
      const dto: FestivalCandidate = {
        tagIds: [...c.tags.map((t) => t.id), ...c.travellerFitTags.map((t) => t.id)],
        popularity: c.popularity,
        featured: c.featured,
        occurrence,
        hasDestinationConnection: c._count.destinations > 0,
      };
      const { score, signals } = scoreFestival(dto, context);
      const rec: Recommendation<FestivalRecommendationItem> = {
        item: {
          id: c.id,
          slug: c.slug,
          name: c.name,
          location: { name: c.location.name },
          imageUrl: festMedia.get(c.id)?.[0]?.url ?? null,
          popularity: c.popularity,
          categoryKey: c.categoryId,
          geoKey: geoKeyFor(c.location),
          status: resolveFestivalStatus(occurrence),
        },
        score,
        matchPercent: Math.round(score * 100),
        reasons: explainFestival(signals, context, c.featured),
        personalized: true,
      };
      return rec;
    })
    .sort((a, b) => b.score - a.score);

  return { destinations: scoredDestinations, festivals: scoredFestivals };
}
