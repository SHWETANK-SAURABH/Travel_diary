import { describe, expect, it } from "vitest";
import { isInSeason, formatMonthRange } from "./seasonal";

describe("isInSeason", () => {
  it("returns false when the destination has no best-time window at all", () => {
    expect(isInSeason({ bestTimeStartMonth: null, bestTimeEndMonth: null }, 6)) .toBe(false);
    expect(isInSeason({ bestTimeStartMonth: 3, bestTimeEndMonth: null }, 6)).toBe(false);
  });

  it("returns true when the month falls inside the window", () => {
    expect(isInSeason({ bestTimeStartMonth: 10, bestTimeEndMonth: 3 }, 12)).toBe(true);
  });

  it("returns false when the month falls outside the window", () => {
    expect(isInSeason({ bestTimeStartMonth: 10, bestTimeEndMonth: 3 }, 6)).toBe(false);
  });

  it("defaults to the current month when none is passed", () => {
    const thisMonth = new Date().getUTCMonth() + 1;
    expect(isInSeason({ bestTimeStartMonth: thisMonth, bestTimeEndMonth: thisMonth })).toBe(true);
  });
});

describe("formatMonthRange", () => {
  it("formats a normal range", () => {
    expect(formatMonthRange(3, 5)).toBe("March – May");
  });

  it("formats a single-month range", () => {
    expect(formatMonthRange(12, 12)).toBe("December – December");
  });
});
