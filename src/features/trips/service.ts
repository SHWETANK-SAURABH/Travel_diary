import { db } from "@/lib/db";
import type { ContentType } from "@prisma/client";
import { computeTripDays } from "@/lib/trip/duration";
import { resolveContentRecords } from "@/lib/content/resolve";
import { pickRelevantOccurrence } from "@/features/festivals/service";
import { getNearbyToDestination } from "@/features/destinations/service";
import { getNearbyToFestival } from "@/features/festivals/service";
import type { AddTripItemInput, CreateTripInput, FestivalConflict, TripBudgetEstimate, TripInsights, UpdateTripInput } from "./types";

/** Every function here is scoped to `userId` — trips are never fetched/mutated without an owner check (spec §39: never trust a client-supplied userId). */

export async function listTrips(userId: string) {
  return db.trip.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { location: { select: { name: true } }, _count: { select: { items: true } } },
  });
}

export async function getTrip(userId: string, tripId: string) {
  return db.trip.findFirst({
    where: { id: tripId, userId },
    include: { items: { orderBy: [{ day: "asc" }, { order: "asc" }] }, location: { select: { name: true } } },
  });
}

/**
 * The one intentional exception to the ownership check — a PUBLIC or
 * UNLISTED trip is readable by anyone with the link, per spec §37/§38. The
 * two visibilities differ only in discoverability (PUBLIC could be listed
 * or indexed somewhere; UNLISTED never is) — both grant the same read
 * access to the share page itself. A PRIVATE trip never matches.
 */
export async function getSharedTrip(tripId: string) {
  return db.trip.findFirst({
    where: { id: tripId, visibility: { in: ["PUBLIC", "UNLISTED"] } },
    include: { items: { orderBy: [{ day: "asc" }, { order: "asc" }] }, location: { select: { name: true } } },
  });
}

export async function createTrip(userId: string, input: CreateTripInput) {
  return db.trip.create({
    data: {
      userId,
      name: input.name,
      visibility: input.visibility,
      startDate: input.startDate,
      endDate: input.endDate,
      days: computeTripDays(input.startDate, input.endDate, input.days),
      travellerCount: input.travellerCount,
      estimatedBudget: input.estimatedBudget,
      locationId: input.locationId,
    },
  });
}

export async function updateTrip(userId: string, tripId: string, input: UpdateTripInput) {
  const trip = await db.trip.findFirst({ where: { id: tripId, userId }, select: { startDate: true, endDate: true, days: true } });
  if (!trip) throw new Error("Trip not found");

  const startDate = "startDate" in input ? input.startDate : trip.startDate;
  const endDate = "endDate" in input ? input.endDate : trip.endDate;
  const days = computeTripDays(startDate, endDate, "days" in input ? input.days : trip.days);

  return db.trip.update({
    where: { id: tripId },
    data: {
      name: input.name,
      visibility: input.visibility,
      startDate: input.startDate,
      endDate: input.endDate,
      days,
      travellerCount: input.travellerCount,
      estimatedBudget: input.estimatedBudget,
      locationId: input.locationId,
    },
  });
}

/** Only the Trip/TripItem rows are deleted — cascades via the schema's onDelete: Cascade. SavedContent/VisitedContent live in separate tables and are never touched (spec §34: deleting a trip must not delete saved/visited state). */
export async function deleteTrip(userId: string, tripId: string) {
  const trip = await db.trip.findFirst({ where: { id: tripId, userId }, select: { id: true } });
  if (!trip) throw new Error("Trip not found");
  await db.trip.delete({ where: { id: tripId } });
}

/** New trip id, copied metadata + itinerary structure, always PRIVATE regardless of the source's visibility (spec §35 — a duplicate never inherits public exposure automatically). References the same content ids, never new content rows. */
export async function duplicateTrip(userId: string, tripId: string) {
  const trip = await db.trip.findFirst({ where: { id: tripId, userId }, include: { items: true } });
  if (!trip) throw new Error("Trip not found");

  return db.trip.create({
    data: {
      userId,
      name: `${trip.name} (Copy)`,
      visibility: "PRIVATE",
      startDate: trip.startDate,
      endDate: trip.endDate,
      days: trip.days,
      travellerCount: trip.travellerCount,
      estimatedBudget: trip.estimatedBudget,
      locationId: trip.locationId,
      items: {
        create: trip.items.map((item) => ({
          day: item.day,
          order: item.order,
          contentType: item.contentType,
          contentId: item.contentId,
          locationId: item.locationId,
          notes: item.notes,
        })),
      },
    },
  });
}

export async function addTripItem(userId: string, input: AddTripItemInput) {
  const trip = await db.trip.findFirst({ where: { id: input.tripId, userId }, select: { id: true } });
  if (!trip) throw new Error("Trip not found");

  const maxOrder = await db.tripItem.aggregate({ where: { tripId: input.tripId, day: input.day }, _max: { order: true } });

  return db.tripItem.create({
    data: {
      tripId: input.tripId,
      day: input.day,
      order: (maxOrder._max.order ?? -1) + 1,
      contentType: input.contentType,
      contentId: input.contentId,
      locationId: input.locationId,
      notes: input.notes,
    },
  });
}

/** Removes only the itinerary reference — never the underlying content, its saved state, or its visited state (spec §33). */
export async function removeTripItem(userId: string, tripId: string, itemId: string) {
  const trip = await db.trip.findFirst({ where: { id: tripId, userId }, select: { id: true } });
  if (!trip) throw new Error("Trip not found");
  await db.tripItem.deleteMany({ where: { id: itemId, tripId } });
}

/** Sets `order` from array position — a robust ordering strategy (spec §45) since it's an explicit assignment, not a fragile index shift. */
export async function reorderTripItemsInDay(userId: string, tripId: string, day: number, orderedItemIds: string[]) {
  const trip = await db.trip.findFirst({ where: { id: tripId, userId }, select: { id: true } });
  if (!trip) throw new Error("Trip not found");

  await db.$transaction(orderedItemIds.map((itemId, index) => db.tripItem.updateMany({ where: { id: itemId, tripId, day }, data: { order: index } })));
}

/** Moves to the end of the target day's order — never leaves an item on a day that no longer exists in the trip (spec §12), since the caller (the itinerary UI) only ever offers valid day numbers. */
export async function moveTripItemToDay(userId: string, tripId: string, itemId: string, newDay: number) {
  const trip = await db.trip.findFirst({ where: { id: tripId, userId }, select: { id: true } });
  if (!trip) throw new Error("Trip not found");

  const maxOrder = await db.tripItem.aggregate({ where: { tripId, day: newDay }, _max: { order: true } });
  await db.tripItem.updateMany({ where: { id: itemId, tripId }, data: { day: newDay, order: (maxOrder._max.order ?? -1) + 1 } });
}

/** Resolves every item's content in one batch, reusing the exact Saved/Visited content resolver (Phase 8) — the same polymorphic-reference problem either way. */
export async function resolveTripItems<T extends { contentType: ContentType | null; contentId: string | null }>(items: T[]) {
  const withContent = items.filter((i): i is T & { contentType: ContentType; contentId: string } => i.contentType != null && i.contentId != null);
  const resolved = await resolveContentRecords(withContent);
  const byKey = new Map(resolved.map((r) => [`${r.contentType}:${r.id}`, r]));

  return items.map((item) => ({
    ...item,
    content: item.contentType && item.contentId ? (byKey.get(`${item.contentType}:${item.contentId}`) ?? null) : null,
  }));
}

/**
 * A deliberately simple heuristic (spec §24/§25: "do not present estimates
 * as guaranteed prices... use ranges"): averages `approximateCostPerDay`
 * across the trip's Destination items, multiplied by day count and
 * traveller count, ±20%. `hasData: false` when no item carries cost data
 * at all — the caller hides the estimate instead of showing a fabricated
 * ₹0–₹0.
 */
export async function estimateTripBudget(trip: {
  days: number | null;
  travellerCount: number | null;
  items: { contentType: ContentType | null; contentId: string | null }[];
}): Promise<TripBudgetEstimate> {
  const destinationIds = trip.items.filter((i) => i.contentType === "DESTINATION" && i.contentId).map((i) => i.contentId!);
  if (destinationIds.length === 0) return { low: 0, high: 0, hasData: false };

  const destinations = await db.destination.findMany({ where: { id: { in: destinationIds } }, select: { approximateCostPerDay: true } });
  const costs = destinations.map((d) => d.approximateCostPerDay).filter((c): c is number => c != null);
  if (costs.length === 0) return { low: 0, high: 0, hasData: false };

  const avgCostPerDay = costs.reduce((sum, c) => sum + c, 0) / costs.length;
  const days = trip.days ?? 1;
  const travellers = trip.travellerCount ?? 1;
  const base = avgCostPerDay * days * travellers;

  return { low: Math.round(base * 0.8), high: Math.round(base * 1.2), hasData: true };
}

/**
 * Compares each Festival item's most relevant occurrence against the
 * trip's own dates. Never claims a "confirmed conflict" for a date that
 * isn't itself confirmed/admin-verified (spec §27) — an EXPECTED or
 * NOT_ANNOUNCED date that happens to fall outside the trip window is
 * reported as `UNCERTAIN`, not `CONFIRMED_CONFLICT`.
 */
export async function checkFestivalConflicts(trip: {
  startDate: Date | null;
  endDate: Date | null;
  items: { id: string; contentType: ContentType | null; contentId: string | null }[];
}): Promise<FestivalConflict[]> {
  const festivalItems = trip.items.filter((i) => i.contentType === "FESTIVAL" && i.contentId);
  if (festivalItems.length === 0) return [];

  const festivals = await db.festival.findMany({
    where: { id: { in: festivalItems.map((i) => i.contentId!) } },
    select: { id: true, name: true, occurrences: { orderBy: { year: "desc" }, take: 2, select: { startDate: true, endDate: true, dateConfidence: true, year: true } } },
  });
  const byId = new Map(festivals.map((f) => [f.id, f]));

  return festivalItems.map((item): FestivalConflict => {
    const festival = byId.get(item.contentId!);
    if (!festival) return { tripItemId: item.id, festivalName: "This festival", status: "NONE" };
    if (!trip.startDate || !trip.endDate) return { tripItemId: item.id, festivalName: festival.name, status: "NO_TRIP_DATES" };

    const occurrence = pickRelevantOccurrence(festival.occurrences);
    if (!occurrence?.startDate) return { tripItemId: item.id, festivalName: festival.name, status: "UNCERTAIN" };

    const festStart = occurrence.startDate;
    const festEnd = occurrence.endDate ?? occurrence.startDate;
    const overlaps = festStart <= trip.endDate && festEnd >= trip.startDate;
    if (overlaps) return { tripItemId: item.id, festivalName: festival.name, status: "NONE" };

    const isConfirmed = occurrence.dateConfidence === "CONFIRMED" || occurrence.dateConfidence === "ADMIN_VERIFIED";
    return { tripItemId: item.id, festivalName: festival.name, status: isConfirmed ? "CONFIRMED_CONFLICT" : "UNCERTAIN" };
  });
}

/**
 * "Near your plans" (spec §29/§32) — geographic proximity from the first
 * itinerary item that has coordinates, reusing the existing nearby queries
 * (Phase 4/5) rather than a new discovery system. Never adds anything
 * automatically; the caller only ever displays these as suggestions.
 */
export async function getTripSuggestions(
  items: { contentType: ContentType | null; contentId: string | null; latitude: number | null; longitude: number | null }[],
  limit = 4
) {
  const anchor = items.find((i) => i.latitude != null && i.longitude != null);
  if (!anchor) return { destinations: [], festivals: [] };

  const inTripIds = new Set(items.map((i) => i.contentId).filter(Boolean));
  const point = { id: "anchor", latitude: anchor.latitude, longitude: anchor.longitude };

  const [nearbyDestinations, nearbyFromFestival] = await Promise.all([
    getNearbyToDestination(point, limit + inTripIds.size),
    getNearbyToFestival(point, limit + inTripIds.size),
  ]);

  return {
    destinations: nearbyDestinations.filter((d) => !inTripIds.has(d.id)).slice(0, limit),
    festivals: nearbyFromFestival.festivals.filter((f) => !inTripIds.has(f.id)).slice(0, limit),
  };
}

/**
 * The one call the itinerary editor actually needs: budget + conflicts +
 * suggestions together, from a plain itinerary shape rather than a Prisma
 * Trip row. Deliberately DB-row-agnostic — a guest's itinerary has no Trip
 * row at all (it lives in localStorage), so this is what lets
 * `POST /api/trips/insights` compute the exact same heuristics for a guest
 * trip as `GET /api/trips/[id]` computes for an account one.
 */
export async function getTripInsights(trip: {
  startDate: Date | null;
  endDate: Date | null;
  days: number | null;
  travellerCount: number | null;
  items: { id: string; contentType: ContentType | null; contentId: string | null }[];
}): Promise<TripInsights> {
  const withContent = trip.items.filter((i): i is typeof i & { contentType: ContentType; contentId: string } => i.contentType != null && i.contentId != null);
  const resolved = await resolveContentRecords(withContent);
  const byKey = new Map(resolved.map((r) => [`${r.contentType}:${r.id}`, r]));

  const itemsWithGeo = trip.items.map((i) => {
    const content = i.contentType && i.contentId ? byKey.get(`${i.contentType}:${i.contentId}`) : undefined;
    return { contentType: i.contentType, contentId: i.contentId, latitude: content?.latitude ?? null, longitude: content?.longitude ?? null };
  });

  const [budget, conflicts, suggestionsRaw] = await Promise.all([
    estimateTripBudget({ days: trip.days, travellerCount: trip.travellerCount, items: trip.items }),
    checkFestivalConflicts({ startDate: trip.startDate, endDate: trip.endDate, items: trip.items }),
    getTripSuggestions(itemsWithGeo),
  ]);

  return {
    budget,
    conflicts,
    suggestions: [
      ...suggestionsRaw.destinations.map((d) => ({ id: d.id, slug: d.slug, name: d.name, kind: "destination" as const })),
      ...suggestionsRaw.festivals.map((f) => ({ id: f.id, slug: f.slug, name: f.name, kind: "festival" as const })),
    ],
  };
}
