import { describe, expect, it } from "vitest";
import { isMonthInRange } from "./month-range";

describe("isMonthInRange", () => {
  it("handles a normal (non-wrapping) range", () => {
    expect(isMonthInRange(3, 2, 5)).toBe(true);
    expect(isMonthInRange(2, 2, 5)).toBe(true);
    expect(isMonthInRange(5, 2, 5)).toBe(true);
    expect(isMonthInRange(1, 2, 5)).toBe(false);
    expect(isMonthInRange(6, 2, 5)).toBe(false);
  });

  it("handles a range that wraps the year end (e.g. Nov-Feb)", () => {
    expect(isMonthInRange(12, 11, 2)).toBe(true);
    expect(isMonthInRange(1, 11, 2)).toBe(true);
    expect(isMonthInRange(11, 11, 2)).toBe(true);
    expect(isMonthInRange(2, 11, 2)).toBe(true);
    expect(isMonthInRange(6, 11, 2)).toBe(false);
  });

  it("handles a single-month range", () => {
    expect(isMonthInRange(4, 4, 4)).toBe(true);
    expect(isMonthInRange(5, 4, 4)).toBe(false);
  });
});
