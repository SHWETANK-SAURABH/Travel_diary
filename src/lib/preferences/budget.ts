import type { BudgetLevel } from "@prisma/client";

/**
 * Buckets a numeric total-trip budget into the coarse level the
 * recommendation engine compares directly against `Destination.budgetLevel`
 * — collapses the onboarding UI's 4 presets (₹10K–20K / ₹20K–40K / ₹40K–75K
 * / ₹75K+) into the 3 existing `BudgetLevel` values rather than growing that
 * enum to match 1:1. Lives in `lib`, not `features/users`, so both
 * `src/features/users/service.ts` and `src/lib/guest/merge.ts` (account
 * preference upsert vs. guest-to-account preference merge) can import it
 * without `lib` depending back on `features`.
 */
export function deriveBudgetLevel(budgetAmount: number | null | undefined): BudgetLevel | undefined {
  if (budgetAmount == null) return undefined;
  if (budgetAmount < 20_000) return "BUDGET";
  if (budgetAmount < 75_000) return "MID_RANGE";
  return "LUXURY";
}
