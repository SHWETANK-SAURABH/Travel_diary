import type { DateConfidence } from "@prisma/client";

export type FestivalTemporalStatus = "HAPPENING_NOW" | "UPCOMING" | "PAST" | "EXPECTED" | "NOT_ANNOUNCED";

export interface OccurrenceLike {
  startDate: Date | null;
  endDate: Date | null;
  dateConfidence: DateConfidence;
}

/** Admin-entered occurrence dates carry no meaningful time-of-day — they're calendar days, stored as UTC midnight. */
function endOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
}

function startOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
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
  // The end boundary must cover the whole of its calendar day — both the
  // no-endDate single-day case and an explicit multi-day endDate — or a
  // festival flips to PAST the instant that day's UTC midnight ticks over,
  // hours before the day it's naming has actually finished.
  const end = endOfDayUTC(occurrence.endDate ?? occurrence.startDate);

  if (now >= start && now <= end) return "HAPPENING_NOW";
  if (now < start) return "UPCOMING";
  return "PAST";
}

/** Whole calendar days from `now` to `date` — 0 means "today" (regardless of either value's time-of-day). Negative means the date has passed. */
export function daysUntil(date: Date, now = new Date()): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((startOfDayUTC(date).getTime() - startOfDayUTC(now).getTime()) / msPerDay);
}
