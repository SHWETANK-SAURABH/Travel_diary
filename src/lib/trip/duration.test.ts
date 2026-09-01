import { describe, expect, it } from "vitest";
import { computeTripDays, applyDayCountDelta } from "./duration";

describe("computeTripDays", () => {
  it("computes an inclusive day count from start/end dates", () => {
    expect(computeTripDays("2026-10-10", "2026-10-14", undefined)).toBe(5);
  });

  it("treats a same-day trip as 1 day", () => {
    expect(computeTripDays("2026-10-10", "2026-10-10", undefined)).toBe(1);
  });

  it("falls back to the manually-set days when dates aren't both present", () => {
    expect(computeTripDays("2026-10-10", undefined, 3)).toBe(3);
    expect(computeTripDays(undefined, undefined, 7)).toBe(7);
    expect(computeTripDays(undefined, undefined, undefined)).toBeUndefined();
  });

  it("returns undefined for an inverted date range rather than a negative day count", () => {
    expect(computeTripDays("2026-10-14", "2026-10-10", 3)).toBeUndefined();
  });

  it("accepts Date objects as well as ISO strings", () => {
    expect(computeTripDays(new Date("2026-01-01"), new Date("2026-01-03"), undefined)).toBe(3);
  });
});

describe("applyDayCountDelta", () => {
  it("extends endDate by a day when both dates are set", () => {
    const result = applyDayCountDelta("2026-10-10", "2026-10-14", null, 1);
    expect(result).toEqual({ endDate: "2026-10-15" });
  });

  it("shrinks endDate by a day when both dates are set", () => {
    const result = applyDayCountDelta("2026-10-10", "2026-10-14", null, -1);
    expect(result).toEqual({ endDate: "2026-10-13" });
  });

  it("never shrinks endDate before startDate", () => {
    const result = applyDayCountDelta("2026-10-10", "2026-10-10", null, -1);
    expect(result).toEqual({ endDate: "2026-10-10" });
  });

  it("patches `days` directly when the trip has no dates", () => {
    expect(applyDayCountDelta(undefined, undefined, 3, 1)).toEqual({ days: 4 });
    expect(applyDayCountDelta(undefined, undefined, 3, -1)).toEqual({ days: 2 });
  });

  it("never lets a dateless trip drop below 1 day", () => {
    expect(applyDayCountDelta(undefined, undefined, 1, -1)).toEqual({ days: 1 });
  });

  it("defaults a missing `days` to 1 before applying the delta", () => {
    expect(applyDayCountDelta(undefined, undefined, undefined, 1)).toEqual({ days: 2 });
  });
});
