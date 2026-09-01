import { db } from "@/lib/db";

/**
 * Re-keys a newly-signed-in user's pre-signup analytics rows from their
 * anonymous id onto their account (spec §6: "do not create unnecessary
 * duplicate identities... follow the provider's privacy-safe identity
 * model"). Called once alongside the guest content merge, not inside its
 * transaction — this touches analytics tables, a separate concern from
 * guest save/visited/trip data, and is naturally idempotent on its own
 * (re-running finds nothing left with the old anonymousId to move).
 */
export async function mergeAnonymousAnalyticsIdentity(userId: string, anonymousId: string | undefined): Promise<void> {
  if (!anonymousId) return;
  await Promise.all([
    db.analyticsEvent.updateMany({ where: { anonymousId, userId: null }, data: { userId } }),
    db.searchQueryLog.updateMany({ where: { anonymousId, userId: null }, data: { userId } }),
  ]);
}
