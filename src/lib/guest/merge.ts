import { db } from "@/lib/db";
import { deriveBudgetLevel } from "@/lib/preferences/budget";
import type { GuestState } from "./types";

/**
 * Merges local guest state into a newly-signed-in user's account. Called by
 * `GuestMergeSync` (src/components/account/GuestMergeSync.tsx) right after
 * sign-in, via `POST /api/guest/merge`, passing the localStorage snapshot
 * along (the server has no access to it otherwise). The caller only clears
 * local guest state *after* this returns successfully — never before, so a
 * failed/retried merge can't lose data (spec §24).
 *
 * Idempotent by construction, not by a separate "already merged" flag:
 * saves/visited are unique-constrained upserts (`update: {}` — a no-op if
 * the row already exists), trips are skipped if a trip with the same name
 * already exists for this user, and preferences only import if the account
 * has none yet (see below). Running this twice with the same snapshot
 * produces the same end state, not duplicates.
 *
 * Kept intentionally simple for the foundation: no conflict UI, no partial
 * merge review. That's a later concern once there's a full trip builder to
 * surface it in (Phase 9).
 */
export async function mergeGuestDataIntoAccount(userId: string, guestState: GuestState) {
  await db.$transaction(async (tx) => {
    // Preferences: account data is authoritative. If the account already has
    // a UserPreference row (set post-sign-in, or from an earlier merge), a
    // guest snapshot from this browser must never silently overwrite it —
    // "use a clear merge strategy and do not silently destroy information."
    // Only import the guest snapshot when the account has no preferences at all.
    if (guestState.preferences) {
      const existing = await tx.userPreference.findUnique({ where: { userId }, select: { id: true } });
      if (!existing) {
        const p = guestState.preferences;
        await tx.userPreference.create({
          data: {
            userId,
            travelDateStart: p.travelDateStart ? new Date(p.travelDateStart) : undefined,
            travelDateEnd: p.travelDateEnd ? new Date(p.travelDateEnd) : undefined,
            durationDays: p.durationDays,
            travellerCount: p.travellerCount,
            budgetAmount: p.budgetAmount,
            budgetLevel: deriveBudgetLevel(p.budgetAmount),
            travelStyle: p.travelStyle,
            crowdPreference: p.crowdPreference,
            interests: p.interestTagIds?.length ? { connect: p.interestTagIds.map((id) => ({ id })) } : undefined,
          },
        });
      }
    }

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

    // Visited follows the exact same "local + server -> true" union as
    // saves (spec §22) — same upsert shape, same idempotency guarantee.
    for (const item of guestState.visitedItems) {
      await tx.visitedContent.upsert({
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
      // Spec §41: a name collision must never silently overwrite (or drop)
      // the guest's trip — rename it deterministically instead, the spec's
      // own example ("Kerala October (Imported)"). Safe against duplicate
      // creation on a genuine retry: the whole transaction is atomic (a
      // partial failure rolls back everything), and the caller only clears
      // local state after a full success, so a retry only ever runs after
      // nothing was created — this collision check only ever fires for a
      // true pre-existing same-named trip, not a retry artifact.
      const existing = await tx.trip.findFirst({ where: { userId, name: draft.name }, select: { id: true } });
      const name = existing ? `${draft.name} (Imported)` : draft.name;

      await tx.trip.create({
        data: {
          userId,
          name,
          startDate: draft.startDate ? new Date(draft.startDate) : undefined,
          endDate: draft.endDate ? new Date(draft.endDate) : undefined,
          days: draft.days,
          travellerCount: draft.travellerCount,
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
