import { db } from "@/lib/db";
import type { ContentType } from "@prisma/client";
import { mergeGuestDataIntoAccount } from "@/lib/guest/merge";
import type { GuestState } from "@/lib/guest/types";
import type { UpdatePreferenceInput } from "./types";

// All preference fields are optional per the product spec — never require
// completing this before browsing.
export async function getPreference(userId: string) {
  return db.userPreference.findUnique({ where: { userId }, include: { interests: true } });
}

export async function upsertPreference(userId: string, input: UpdatePreferenceInput) {
  return db.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      travelDateStart: input.travelDateStart,
      travelDateEnd: input.travelDateEnd,
      durationDays: input.durationDays,
      travellerCount: input.travellerCount,
      budgetLevel: input.budgetLevel,
      travelStyle: input.travelStyle,
      crowdPreference: input.crowdPreference,
      interests: input.interestTagIds ? { connect: input.interestTagIds.map((id) => ({ id })) } : undefined,
    },
    update: {
      travelDateStart: input.travelDateStart,
      travelDateEnd: input.travelDateEnd,
      durationDays: input.durationDays,
      travellerCount: input.travellerCount,
      budgetLevel: input.budgetLevel,
      travelStyle: input.travelStyle,
      crowdPreference: input.crowdPreference,
      interests: input.interestTagIds ? { set: input.interestTagIds.map((id) => ({ id })) } : undefined,
    },
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

export async function markVisited(userId: string, contentType: ContentType, contentId: string) {
  return db.visitedContent.upsert({
    where: { userId_contentType_contentId: { userId, contentType, contentId } },
    create: { userId, contentType, contentId },
    update: {},
  });
}

/** Thin re-export so callers only ever import user-account operations from src/features/users. */
export async function mergeGuestData(userId: string, guestState: GuestState) {
  return mergeGuestDataIntoAccount(userId, guestState);
}
