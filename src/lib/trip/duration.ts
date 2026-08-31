/**
 * Derives a trip's day count from its dates when both are set (spec §9:
 * "calculate: end date - start date... store the actual itinerary
 * duration") — inclusive, so a trip starting and ending the same day is 1
 * day. Falls back to whatever `days` was already set to (a guest's quick
 * "just the day count, no exact dates yet" trip) when dates aren't both
 * present. Shared by the guest store and the server-side trip service so
 * the two can never compute this differently.
 */
export function computeTripDays(startDate: Date | string | null | undefined, endDate: Date | string | null | undefined, fallbackDays: number | null | undefined): number | undefined {
  if (startDate && endDate) {
    const start = typeof startDate === "string" ? new Date(startDate) : startDate;
    const end = typeof endDate === "string" ? new Date(endDate) : endDate;
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;
    return diff > 0 ? diff : undefined;
  }
  return fallbackDays ?? undefined;
}

/**
 * "Add day" / "Remove day" (spec §12) has to go through whichever field
 * actually drives the day count: once a trip has both dates set,
 * `computeTripDays` always derives `days` from them (see above), so a
 * direct `{days: n}` patch would be silently overwritten — the fix has to
 * extend/shrink `endDate` by a day instead. A dateless trip has no such
 * derivation, so it patches `days` directly. Shared by the guest editor and
 * the account editor so both grow/shrink a trip identically.
 */
export function applyDayCountDelta(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
  days: number | null | undefined,
  delta: number
): { startDate?: string; endDate?: string; days?: number } {
  if (startDate && endDate) {
    const start = typeof startDate === "string" ? new Date(startDate) : new Date(startDate);
    const end = typeof endDate === "string" ? new Date(endDate) : new Date(endDate);
    end.setDate(end.getDate() + delta);
    if (end < start) end.setTime(start.getTime());
    return { endDate: end.toISOString().slice(0, 10) };
  }
  return { days: Math.max(1, (days ?? 1) + delta) };
}
