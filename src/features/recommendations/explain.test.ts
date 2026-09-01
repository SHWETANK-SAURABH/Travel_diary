import { describe, expect, it } from "vitest";
import { explainDestination, explainFestival } from "./explain";
import type { RecommendationSignals, RecommendationContext } from "./types";

const NEUTRAL_SIGNALS: RecommendationSignals = {
  season: 0.5,
  budget: 0.5,
  duration: 0.5,
  interest: 0.5,
  travelStyle: 0.5,
  crowd: 0.5,
  festival: 0.5,
  quality: 0.5,
  uniqueness: 0.5,
  popularity: 0.5,
};

describe("explainDestination", () => {
  it("never returns an empty list, even for a fully neutral candidate", () => {
    const reasons = explainDestination(NEUTRAL_SIGNALS, {}, false);
    expect(reasons.length).toBeGreaterThan(0);
  });

  it("caps at 4 reasons even when many thresholds clear", () => {
    const allHigh: RecommendationSignals = { ...NEUTRAL_SIGNALS, interest: 0.9, season: 0.95, budget: 0.95, festival: 0.95, uniqueness: 0.95, travelStyle: 0.95, duration: 0.95 };
    const context: RecommendationContext = { interestTagIds: ["beach"], budgetAmount: 10000, travelStyle: "LUXURY", durationDays: 5 };
    const reasons = explainDestination(allHigh, context, true);
    expect(reasons.length).toBeLessThanOrEqual(4);
  });

  it("only credits a matching interest when the context actually stated one", () => {
    const highInterest: RecommendationSignals = { ...NEUTRAL_SIGNALS, interest: 0.9 };
    const withInterest = explainDestination(highInterest, { interestTagIds: ["beach"] }, false);
    const withoutInterest = explainDestination(highInterest, {}, false);
    expect(withInterest).toContain("Matches your interests");
    expect(withoutInterest).not.toContain("Matches your interests");
  });

  it("never fabricates a budget-fit reason when the traveller gave no budget", () => {
    const highBudget: RecommendationSignals = { ...NEUTRAL_SIGNALS, budget: 0.95 };
    const reasons = explainDestination(highBudget, {}, false);
    expect(reasons).not.toContain("Fits your budget");
  });

  it("includes Editor's pick for featured content when there's room", () => {
    const reasons = explainDestination(NEUTRAL_SIGNALS, {}, true);
    expect(reasons).toContain("Editor's pick");
  });
});

describe("explainFestival", () => {
  it("never returns an empty list", () => {
    const reasons = explainFestival(NEUTRAL_SIGNALS, {}, false);
    expect(reasons.length).toBeGreaterThan(0);
  });

  it("only credits 'happening during your trip' when the traveller actually has dates/month set", () => {
    const highSeason: RecommendationSignals = { ...NEUTRAL_SIGNALS, season: 0.95 };
    const withDates = explainFestival(highSeason, { travelDateStart: new Date("2026-12-01") }, false);
    const withoutDates = explainFestival(highSeason, {}, false);
    expect(withDates).toContain("Happening during your trip");
    expect(withoutDates).not.toContain("Happening during your trip");
  });

  it("falls back to an honest generic reason for a well-known but otherwise-neutral festival", () => {
    const popular: RecommendationSignals = { ...NEUTRAL_SIGNALS, popularity: 0.9 };
    const reasons = explainFestival(popular, {}, false);
    expect(reasons).toContain("One of India's best-known festivals");
  });
});
