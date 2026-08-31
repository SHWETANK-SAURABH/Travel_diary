/**
 * How long since `lastVerifiedAt` before content counts as "stale" for the
 * dashboard/verification queue (spec §34). A deliberately simple, single
 * threshold — the spec explicitly warns against inventing a false
 * "accuracy" guarantee, so this drives a "needs review" nudge, never an
 * "incorrect" claim.
 */
export const STALE_VERIFICATION_DAYS = 180;
