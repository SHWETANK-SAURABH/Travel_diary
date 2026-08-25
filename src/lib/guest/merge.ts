import { db } from "@/lib/db";
import type { GuestState } from "./types";

/**
 * Merges local guest state into a newly-signed-in user's account. Called
 * from a server action/route the client hits right after sign-in, passing
 * the localStorage snapshot along (the server has no access to it
 * otherwise). Idempotent: safe to call more than once for the same guest
 * snapshot (saves are unique-constrained; trips are matched by localId via
 * TripItem-free re-creation is avoided by only importing trips once per
 * name — see note below).
 *
 * Kept intentionally simple for the foundation: no conflict UI, no partial
 * merge review. That's a Phase 2+ concern once there's a trip builder to
 * surface it in.
 */
export async function mergeGuestDataIntoAccount(userId: string, guestState: GuestState) {
  await db.$transaction(async (tx) => {
    for (const item of guestState.savedItems) {
      await tx.savedContent.upsert({
        where: {
          userId_contentType_contentId: {
            userId,
            contentType: item.contentType,
            contentId: item.contentId,
          },
        },
        create: { userId, contentType: item.contentType, contentId: item.contentId },
        update: {},
      });
    }

    for (const draft of guestState.trips) {
      const existing = await tx.trip.findFirst({ where: { userId, name: draft.name } });
      if (existing) continue; // avoid duplicating a trip the user already synced

      await tx.trip.create({
        data: {
          userId,
          name: draft.name,
          days: draft.days,
          estimatedBudget: draft.estimatedBudget,
          items: {
            create: draft.items.map((item) => ({
              day: item.day,
              order: item.order,
              contentType: item.contentType,
              contentId: item.contentId,
              notes: item.notes,
            })),
          },
        },
      });
    }
  });
}
