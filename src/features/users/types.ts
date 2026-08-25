import type { BudgetLevel, CrowdPreference, TravelStyle } from "@prisma/client";

export interface UpdatePreferenceInput {
  travelDateStart?: Date;
  travelDateEnd?: Date;
  durationDays?: number;
  travellerCount?: number;
  budgetLevel?: BudgetLevel;
  travelStyle?: TravelStyle;
  crowdPreference?: CrowdPreference;
  interestTagIds?: string[];
}
