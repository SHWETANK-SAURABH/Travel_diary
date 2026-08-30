import { isMonthInRange } from "@/lib/date/month-range";

export interface BestTimeWindow {
  bestTimeStartMonth: number | null;
  bestTimeEndMonth: number | null;
}

/** Whether `month` (1-12, defaults to now) falls inside a destination's best-time window — the "seasonal indicator" on cards and the hero. */
export function isInSeason(destination: BestTimeWindow, month: number = new Date().getUTCMonth() + 1): boolean {
  if (destination.bestTimeStartMonth == null || destination.bestTimeEndMonth == null) return false;
  return isMonthInRange(month, destination.bestTimeStartMonth, destination.bestTimeEndMonth);
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatMonthRange(startMonth: number, endMonth: number): string {
  return `${MONTH_NAMES[startMonth - 1]} – ${MONTH_NAMES[endMonth - 1]}`;
}
