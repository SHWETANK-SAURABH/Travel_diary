import { describe, expect, it } from "vitest";
import { resolveFestivalStatus, daysUntil, type OccurrenceLike } from "./status";

const NOW = new Date("2026-06-15T12:00:00Z");

function occurrence(overrides: Partial<OccurrenceLike>): OccurrenceLike {
  return { startDate: null, endDate: null, dateConfidence: "CONFIRMED", ...overrides };
}

describe("resolveFestivalStatus", () => {
  it("returns NOT_ANNOUNCED when there is no occurrence at all", () => {
    expect(resolveFestivalStatus(null, NOW)).toBe("NOT_ANNOUNCED");
    expect(resolveFestivalStatus(undefined, NOW)).toBe("NOT_ANNOUNCED");
  });

  it("returns NOT_ANNOUNCED when the occurrence has no start date and isn't EXPECTED", () => {
    expect(resolveFestivalStatus(occurrence({ startDate: null, dateConfidence: "NOT_ANNOUNCED" }), NOW)).toBe("NOT_ANNOUNCED");
  });

  it("returns EXPECTED when there's no date yet but confidence is EXPECTED", () => {
    expect(resolveFestivalStatus(occurrence({ startDate: null, dateConfidence: "EXPECTED" }), NOW)).toBe("EXPECTED");
  });

  it("returns HAPPENING_NOW when now falls within [start, end]", () => {
    const occ = occurrence({ startDate: new Date("2026-06-10"), endDate: new Date("2026-06-20") });
    expect(resolveFestivalStatus(occ, NOW)).toBe("HAPPENING_NOW");
  });

  it("treats a single-day occurrence (no endDate) as happening on that exact day", () => {
    const occ = occurrence({ startDate: new Date("2026-06-15T00:00:00Z"), endDate: null });
    expect(resolveFestivalStatus(occ, new Date("2026-06-15T18:00:00Z"))).toBe("HAPPENING_NOW");
  });

  it("returns UPCOMING when start is in the future", () => {
    const occ = occurrence({ startDate: new Date("2026-07-01"), endDate: new Date("2026-07-05") });
    expect(resolveFestivalStatus(occ, NOW)).toBe("UPCOMING");
  });

  it("returns UPCOMING (never CONFIRMED-as-fact) even when dateConfidence is only EXPECTED, as long as a date exists", () => {
    const occ = occurrence({ startDate: new Date("2026-07-01"), endDate: new Date("2026-07-05"), dateConfidence: "EXPECTED" });
    expect(resolveFestivalStatus(occ, NOW)).toBe("UPCOMING");
  });

  it("returns PAST when end is before now", () => {
    const occ = occurrence({ startDate: new Date("2026-01-01"), endDate: new Date("2026-01-05") });
    expect(resolveFestivalStatus(occ, NOW)).toBe("PAST");
  });
});

describe("daysUntil", () => {
  it("returns 0 for today", () => {
    expect(daysUntil(new Date("2026-06-15T23:00:00Z"), NOW)).toBe(0);
  });

  it("rounds up to whole days for a future date", () => {
    expect(daysUntil(new Date("2026-06-20T00:00:00Z"), NOW)).toBe(5);
  });

  it("returns a negative number for a past date", () => {
    expect(daysUntil(new Date("2026-06-10T00:00:00Z"), NOW)).toBeLessThan(0);
  });
});
