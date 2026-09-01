import { describe, expect, it } from "vitest";
import { scoreDestination, rankDestinations, type RankableDestination } from "./ranking";

function destination(overrides: Partial<RankableDestination>): RankableDestination {
  return { id: "d1", popularity: "LOCAL_EMERGING", featured: false, bestTimeStartMonth: null, bestTimeEndMonth: null, hasFestivalConnection: false, ...overrides };
}

describe("scoreDestination (editorial ranking)", () => {
  it("weighs featured content above everything else", () => {
    const featured = scoreDestination(destination({ featured: true }));
    const notFeatured = scoreDestination(destination({ featured: false }));
    expect(featured).toBeGreaterThan(notFeatured);
  });

  it("rewards seasonal fit only when a month is given", () => {
    const inSeason = scoreDestination(destination({ bestTimeStartMonth: 10, bestTimeEndMonth: 2 }), { month: 12 });
    const noMonth = scoreDestination(destination({ bestTimeStartMonth: 10, bestTimeEndMonth: 2 }), {});
    expect(inSeason).toBeGreaterThan(noMonth);
  });

  it("does not let popularity alone dominate — hidden/local destinations score comparably to popular ones", () => {
    const popular = scoreDestination(destination({ popularity: "POPULAR" }));
    const hidden = scoreDestination(destination({ popularity: "HIDDEN" }));
    const local = scoreDestination(destination({ popularity: "LOCAL_EMERGING" }));
    // None should be wildly larger than another — the spec's "diversity boost" keeps them in the same ballpark.
    const scores = [popular, hidden, local];
    expect(Math.max(...scores) - Math.min(...scores)).toBeLessThanOrEqual(5);
  });
});

describe("rankDestinations", () => {
  it("sorts highest score first", () => {
    const list = [destination({ id: "a", featured: false }), destination({ id: "b", featured: true })];
    const ranked = rankDestinations(list);
    expect(ranked[0].id).toBe("b");
  });

  it("does not mutate the input array", () => {
    const list = [destination({ id: "a" }), destination({ id: "b", featured: true })];
    const copy = [...list];
    rankDestinations(list);
    expect(list).toEqual(copy);
  });
});
