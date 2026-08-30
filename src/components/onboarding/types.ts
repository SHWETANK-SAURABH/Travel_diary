export interface OnboardingValues {
  travelDateStart?: string; // yyyy-mm-dd
  travelDateEnd?: string;
  durationDays?: number;
  travellerCount?: number;
  budgetAmount?: number;
  travelStyle?: "BACKPACKER" | "BUDGET" | "COMFORTABLE" | "LUXURY";
  /** 0 (busy & lively) .. 100 (quiet & peaceful). */
  crowdPreference?: number;
  interestTagIds?: string[];
}

export interface InterestTagOption {
  id: string;
  name: string;
  slug: string;
}
