/**
 * Whether `month` (1-12) falls within [start, end] (both 1-12), handling
 * ranges that wrap the year end (e.g. Nov(11)–Feb(2)). Shared by the
 * recommendation scorer and the destination ranking heuristic — both need
 * "is this month within a destination's best-time window."
 */
export function isMonthInRange(month: number, start: number, end: number): boolean {
  if (start <= end) return month >= start && month <= end;
  return month >= start || month <= end;
}
