import type { BudgetLevel, TravelStyle } from "@prisma/client";

export interface UpdatePreferenceInput {
  travelDateStart?: Date;
  travelDateEnd?: Date;
  durationDays?: number;
  travellerCount?: number;
  /** Numeric total trip budget in INR — `budgetLevel` is derived from this, see deriveBudgetLevel(). */
  budgetAmount?: number;
  travelStyle?: TravelStyle;
  /** 0 (busy & lively) .. 100 (quiet & peaceful). */
  crowdPreference?: number;
  interestTagIds?: string[];
}

export type { BudgetLevel };
