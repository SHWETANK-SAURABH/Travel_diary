import { db } from "@/lib/db";
import type { AddTripItemInput, CreateTripInput } from "./types";

/** Every function here is scoped to `userId` — trips are never fetched/mutated without an owner check. */

export async function listTrips(userId: string) {
  return db.trip.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
}

export async function getTrip(userId: string, tripId: string) {
  return db.trip.findFirst({
    where: { id: tripId, userId },
    include: { items: { orderBy: [{ day: "asc" }, { order: "asc" }] } },
  });
}

export async function createTrip(userId: string, input: CreateTripInput) {
  return db.trip.create({
    data: {
      userId,
      name: input.name,
      visibility: input.visibility,
      estimatedBudget: input.estimatedBudget,
      days: input.days,
    },
  });
}

export async function addTripItem(userId: string, input: AddTripItemInput) {
  const trip = await db.trip.findFirst({ where: { id: input.tripId, userId }, select: { id: true } });
  if (!trip) throw new Error("Trip not found");

  return db.tripItem.create({
    data: {
      tripId: input.tripId,
      day: input.day,
      order: input.order ?? 0,
      contentType: input.contentType,
      contentId: input.contentId,
      locationId: input.locationId,
      notes: input.notes,
    },
  });
}

export async function deleteTrip(userId: string, tripId: string) {
  const trip = await db.trip.findFirst({ where: { id: tripId, userId }, select: { id: true } });
  if (!trip) throw new Error("Trip not found");
  await db.trip.delete({ where: { id: tripId } });
}
