import { db } from "@/lib/db";
import type { ContentType } from "@prisma/client";
import { mergeGuestDataIntoAccount } from "@/lib/guest/merge";
import type { GuestState } from "@/lib/guest/types";
import { deriveBudgetLevel } from "@/lib/preferences/budget";
import { mediaForMany } from "@/lib/media";
import type { ResolvedContentItem, UpdatePreferenceInput } from "./types";

// All preference fields are optional per the product spec — never require
// completing this before browsing.
export async function getPreference(userId: string) {
  return db.userPreference.findUnique({ where: { userId }, include: { interests: true } });
}

/** The onboarding wizard's interest chips — DB-backed taxonomy, never hardcoded (see docs/database.md). */
export async function listInterestTags() {
  return db.tag.findMany({ where: { category: "INTEREST" }, orderBy: { name: "asc" } });
}

export async function upsertPreference(userId: string, input: UpdatePreferenceInput) {
  const budgetLevel = deriveBudgetLevel(input.budgetAmount);

  return db.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      travelDateStart: input.travelDateStart,
      travelDateEnd: input.travelDateEnd,
      durationDays: input.durationDays,
      travellerCount: input.travellerCount,
      budgetAmount: input.budgetAmount,
      budgetLevel,
      travelStyle: input.travelStyle,
      crowdPreference: input.crowdPreference,
      interests: input.interestTagIds ? { connect: input.interestTagIds.map((id) => ({ id })) } : undefined,
    },
    update: {
      travelDateStart: input.travelDateStart,
      travelDateEnd: input.travelDateEnd,
      durationDays: input.durationDays,
      travellerCount: input.travellerCount,
      budgetAmount: input.budgetAmount,
      budgetLevel,
      travelStyle: input.travelStyle,
      crowdPreference: input.crowdPreference,
      interests: input.interestTagIds ? { set: input.interestTagIds.map((id) => ({ id })) } : undefined,
    },
    include: { interests: true },
  });
}

export async function toggleSavedContent(userId: string, contentType: ContentType, contentId: string) {
  const existing = await db.savedContent.findUnique({
    where: { userId_contentType_contentId: { userId, contentType, contentId } },
  });

  if (existing) {
    await db.savedContent.delete({ where: { id: existing.id } });
    return { saved: false };
  }

  await db.savedContent.create({ data: { userId, contentType, contentId } });
  return { saved: true };
}

export async function isContentSaved(userId: string, contentType: ContentType, contentId: string) {
  const existing = await db.savedContent.findUnique({
    where: { userId_contentType_contentId: { userId, contentType, contentId } },
    select: { id: true },
  });
  return existing != null;
}

/** V1 "visited" is a simple toggle — no dates, notes, or photos, per the product spec. */
export async function toggleVisitedContent(userId: string, contentType: ContentType, contentId: string) {
  const existing = await db.visitedContent.findUnique({
    where: { userId_contentType_contentId: { userId, contentType, contentId } },
  });

  if (existing) {
    await db.visitedContent.delete({ where: { id: existing.id } });
    return { visited: false };
  }

  await db.visitedContent.create({ data: { userId, contentType, contentId } });
  return { visited: true };
}

export async function isContentVisited(userId: string, contentType: ContentType, contentId: string) {
  const existing = await db.visitedContent.findUnique({
    where: { userId_contentType_contentId: { userId, contentType, contentId } },
    select: { id: true },
  });
  return existing != null;
}

/** Thin re-export so callers only ever import user-account operations from src/features/users. */
export async function mergeGuestData(userId: string, guestState: GuestState) {
  return mergeGuestDataIntoAccount(userId, guestState);
}

/**
 * Resolves `(contentType, contentId)` pairs — the polymorphic shape
 * SavedContent/VisitedContent are stored in, per the trade-off documented
 * on the Media model in schema.prisma — into real content records, batched
 * per type rather than one query per row. A row whose target no longer
 * exists (deleted content) is silently dropped rather than crashing the
 * whole list, the same "service layer enforces this integrity, not the
 * database" trade-off applies here as everywhere else this pattern is used.
 */
async function resolveContentRecords(records: { contentType: ContentType; contentId: string }[]): Promise<ResolvedContentItem[]> {
  const idsByType = new Map<ContentType, string[]>();
  for (const record of records) {
    idsByType.set(record.contentType, [...(idsByType.get(record.contentType) ?? []), record.contentId]);
  }

  const [festivals, destinations, experiences, foods, events] = await Promise.all([
    idsByType.has("FESTIVAL")
      ? db.festival.findMany({ where: { id: { in: idsByType.get("FESTIVAL")! } }, select: { id: true, slug: true, name: true, location: { select: { name: true } } } })
      : [],
    idsByType.has("DESTINATION")
      ? db.destination.findMany({ where: { id: { in: idsByType.get("DESTINATION")! } }, select: { id: true, slug: true, name: true, location: { select: { name: true } } } })
      : [],
    idsByType.has("EXPERIENCE")
      ? db.experience.findMany({ where: { id: { in: idsByType.get("EXPERIENCE")! } }, select: { id: true, slug: true, name: true, location: { select: { name: true } } } })
      : [],
    idsByType.has("FOOD") ? db.food.findMany({ where: { id: { in: idsByType.get("FOOD")! } }, select: { id: true, slug: true, name: true, region: true } }) : [],
    idsByType.has("EVENT")
      ? db.event.findMany({ where: { id: { in: idsByType.get("EVENT")! } }, select: { id: true, name: true, location: { select: { name: true } } } })
      : [],
  ]);

  const [festivalMedia, destinationMedia] = await Promise.all([
    mediaForMany(
      "FESTIVAL",
      festivals.map((f) => f.id)
    ),
    mediaForMany(
      "DESTINATION",
      destinations.map((d) => d.id)
    ),
  ]);

  const byKey = new Map<string, ResolvedContentItem>();
  for (const f of festivals) {
    byKey.set(`FESTIVAL:${f.id}`, { contentType: "FESTIVAL", id: f.id, name: f.name, slug: f.slug, href: `/festivals/${f.slug}`, locationName: f.location.name, imageUrl: festivalMedia.get(f.id)?.[0]?.url ?? null });
  }
  for (const d of destinations) {
    byKey.set(`DESTINATION:${d.id}`, { contentType: "DESTINATION", id: d.id, name: d.name, slug: d.slug, href: `/destinations/${d.slug}`, locationName: d.location.name, imageUrl: destinationMedia.get(d.id)?.[0]?.url ?? null });
  }
  for (const e of experiences) {
    byKey.set(`EXPERIENCE:${e.id}`, { contentType: "EXPERIENCE", id: e.id, name: e.name, slug: e.slug, href: null, locationName: e.location.name, imageUrl: null });
  }
  for (const f of foods) {
    byKey.set(`FOOD:${f.id}`, { contentType: "FOOD", id: f.id, name: f.name, slug: f.slug, href: null, locationName: f.region, imageUrl: null });
  }
  for (const ev of events) {
    byKey.set(`EVENT:${ev.id}`, { contentType: "EVENT", id: ev.id, name: ev.name, slug: null, href: null, locationName: ev.location?.name ?? null, imageUrl: null });
  }

  return records.map((r) => byKey.get(`${r.contentType}:${r.contentId}`)).filter((item): item is ResolvedContentItem => item != null);
}

export async function listSavedContent(userId: string): Promise<ResolvedContentItem[]> {
  const rows = await db.savedContent.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return resolveContentRecords(rows);
}

export async function listVisitedContent(userId: string): Promise<ResolvedContentItem[]> {
  const rows = await db.visitedContent.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return resolveContentRecords(rows);
}
