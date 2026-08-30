import type { Tag, UserPreference } from "@prisma/client";
import type { RecommendationContext } from "./types";

type PreferenceWithInterests = UserPreference & { interests: Tag[] };

/** Flattens a stored UserPreference row into the scorer's context shape — the one place this mapping happens, used by the recommendations API route and the detail-page "context-aware" integrations alike. */
export function preferenceToContext(preference: PreferenceWithInterests | null, base: Partial<RecommendationContext> = {}): RecommendationContext {
  if (!preference) return { ...base };
  return {
    ...base,
    interestTagIds: preference.interests.map((tag) => tag.id),
    travelStyle: preference.travelStyle ?? undefined,
    budgetAmount: preference.budgetAmount ?? undefined,
    durationDays: preference.durationDays ?? undefined,
    travellerCount: preference.travellerCount ?? undefined,
    crowdPreference: preference.crowdPreference ?? undefined,
    travelDateStart: preference.travelDateStart ?? undefined,
    travelDateEnd: preference.travelDateEnd ?? undefined,
  };
}
