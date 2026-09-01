import { describe, expect, it } from "vitest";
import { hasPersonalizationSignal, scoreDestination, scoreFestival, type DestinationCandidate, type FestivalCandidate } from "./scoring";
import type { RecommendationContext } from "./types";

const NEUTRAL_DESTINATION: DestinationCandidate = {
  tagIds: [],
  budgetLevel: null,
  approximateCostPerDay: null,
  bestTimeStartMonth: null,
  bestTimeEndMonth: null,
  popularity: "LOCAL_EMERGING",
  featured: false,
  hasFestivalConnection: false,
};

const NEUTRAL_FESTIVAL: FestivalCandidate = {
  tagIds: [],
  popularity: "LOCAL_EMERGING",
  featured: false,
  occurrence: null,
  hasDestinationConnection: false,
};

describe("hasPersonalizationSignal", () => {
  it("is false for a completely empty context (anonymous visitor)", () => {
    expect(hasPersonalizationSignal({})).toBe(false);
  });

  it("is true when any single signal is present", () => {
    expect(hasPersonalizationSignal({ interestTagIds: ["beach"] })).toBe(true);
    expect(hasPersonalizationSignal({ travelStyle: "LUXURY" })).toBe(true);
    expect(hasPersonalizationSignal({ budgetAmount: 50000 })).toBe(true);
    expect(hasPersonalizationSignal({ durationDays: 5 })).toBe(true);
    expect(hasPersonalizationSignal({ crowdPreference: 30 })).toBe(true);
  });

  it("is not tripped by fields that aren't real personalization signals", () => {
    expect(hasPersonalizationSignal({ stateSlug: "kerala", month: 6 })).toBe(false);
  });
});

describe("scoreDestination", () => {
  it("scores a featured destination higher than an identical unfeatured one", () => {
    const context: RecommendationContext = {};
    const featured = scoreDestination({ ...NEUTRAL_DESTINATION, featured: true }, context);
    const unfeatured = scoreDestination({ ...NEUTRAL_DESTINATION, featured: false }, context);
    expect(featured.score).toBeGreaterThan(unfeatured.score);
  });

  it("scores a destination matching the traveller's interests higher than one that doesn't", () => {
    const context: RecommendationContext = { interestTagIds: ["beach", "wildlife"] };
    const matching = scoreDestination({ ...NEUTRAL_DESTINATION, tagIds: ["beach"] }, context);
    const nonMatching = scoreDestination({ ...NEUTRAL_DESTINATION, tagIds: ["mountains"] }, context);
    expect(matching.score).toBeGreaterThan(nonMatching.score);
  });

  it("never fully sinks a score on crowd mismatch alone (spec: crowd preference caps at a moderate effect)", () => {
    const context: RecommendationContext = { crowdPreference: 100 }; // wants very quiet
    const busy = scoreDestination({ ...NEUTRAL_DESTINATION, popularity: "POPULAR" }, context);
    expect(busy.signals.crowd).toBeGreaterThanOrEqual(0.5);
  });

  it("scores a destination within budget higher than one that blows the budget", () => {
    const context: RecommendationContext = { budgetAmount: 10000, durationDays: 5 };
    const affordable = scoreDestination({ ...NEUTRAL_DESTINATION, approximateCostPerDay: 1000 }, context);
    const expensive = scoreDestination({ ...NEUTRAL_DESTINATION, approximateCostPerDay: 5000 }, context);
    expect(affordable.score).toBeGreaterThan(expensive.score);
  });

  it("scores a destination in-season higher than one out of season for the given month", () => {
    const context: RecommendationContext = { month: 12 };
    const inSeason = scoreDestination({ ...NEUTRAL_DESTINATION, bestTimeStartMonth: 11, bestTimeEndMonth: 2 }, context);
    const outOfSeason = scoreDestination({ ...NEUTRAL_DESTINATION, bestTimeStartMonth: 4, bestTimeEndMonth: 6 }, context);
    expect(inSeason.score).toBeGreaterThan(outOfSeason.score);
  });

  it("never returns a negative or NaN score for a fully-neutral candidate/context", () => {
    const result = scoreDestination(NEUTRAL_DESTINATION, {});
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(Number.isNaN(result.score)).toBe(false);
  });
});

describe("scoreFestival", () => {
  it("scores a festival overlapping the traveller's dates higher than one that doesn't", () => {
    const context: RecommendationContext = { travelDateStart: new Date("2026-12-01"), travelDateEnd: new Date("2026-12-10") };
    const overlapping = scoreFestival({ ...NEUTRAL_FESTIVAL, occurrence: { startDate: new Date("2026-12-05"), endDate: new Date("2026-12-07"), dateConfidence: "CONFIRMED" } }, context);
    const notOverlapping = scoreFestival({ ...NEUTRAL_FESTIVAL, occurrence: { startDate: new Date("2026-03-05"), endDate: new Date("2026-03-07"), dateConfidence: "CONFIRMED" } }, context);
    expect(overlapping.score).toBeGreaterThan(notOverlapping.score);
  });

  it("never treats an unannounced date as a confident seasonal match", () => {
    const context: RecommendationContext = {};
    const result = scoreFestival({ ...NEUTRAL_FESTIVAL, occurrence: { startDate: null, endDate: null, dateConfidence: "NOT_ANNOUNCED" } }, context);
    expect(result.signals.season).toBeLessThan(0.5);
  });

  it("scores a festival connected to a destination higher than an isolated one", () => {
    const context: RecommendationContext = {};
    const connected = scoreFestival({ ...NEUTRAL_FESTIVAL, hasDestinationConnection: true }, context);
    const isolated = scoreFestival({ ...NEUTRAL_FESTIVAL, hasDestinationConnection: false }, context);
    expect(connected.score).toBeGreaterThan(isolated.score);
  });
});
