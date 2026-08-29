import type { DateConfidence } from "@prisma/client";

export type FestivalTemporalStatus = "HAPPENING_NOW" | "UPCOMING" | "PAST" | "EXPECTED" | "NOT_ANNOUNCED";

export interface OccurrenceLike {
  startDate: Date | null;
  endDate: Date | null;
  dateConfidence: DateConfidence;
}

/**
 * Derives the display status the spec calls for (Happening Now / Upcoming /
 * Past / Expected Date / Date Not Announced) from one occurrence row. Never
 * presents an expected date as confirmed — an occurrence with a date but
 * `dateConfidence` still short of CONFIRMED/ADMIN_VERIFIED is temporal
 * status "UPCOMING" (it does have a date to count down to) while the caller
 * is expected to separately surface `dateConfidence` as its own badge.
 */
export function resolveFestivalStatus(occurrence: OccurrenceLike | null | undefined, now = new Date()): FestivalTemporalStatus {
  if (!occurrence || !occurrence.startDate) {
    return occurrence?.dateConfidence === "EXPECTED" ? "EXPECTED" : "NOT_ANNOUNCED";
  }

  const start = occurrence.startDate;
  const end = occurrence.endDate ?? occurrence.startDate;

  if (now >= start && now <= end) return "HAPPENING_NOW";
  if (now < start) return "UPCOMING";
  return "PAST";
}

/** Whole days from `now` to `date`, rounded up — 0 means "today". Negative means the date has passed. */
export function daysUntil(date: Date, now = new Date()): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((date.getTime() - now.getTime()) / msPerDay);
}
