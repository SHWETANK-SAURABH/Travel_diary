import { describe, expect, it } from "vitest";
import { selectDiverse, type DiversityKeys } from "./diversity";
import type { Recommendation } from "./types";

function item(id: string, categoryKey: string | null, geoKey: string | null): DiversityKeys {
  return { id, categoryKey, geoKey };
}

function rec(item: DiversityKeys, score: number): Recommendation<DiversityKeys> {
  return { item, score, matchPercent: Math.round(score * 100), reasons: [], personalized: true };
}

describe("selectDiverse", () => {
  it("returns the top N by score when there's no category/geo repetition", () => {
    const scored = [rec(item("a", "beach", "kerala"), 0.9), rec(item("b", "hills", "himachal"), 0.8), rec(item("c", "desert", "rajasthan"), 0.7)];
    const result = selectDiverse(scored, 3);
    expect(result.map((r) => r.item.id)).toEqual(["a", "b", "c"]);
  });

  it("caps a single category at 2 in the top results when better-scoring alternatives exist", () => {
    const scored = [
      rec(item("a", "beach", "geo1"), 0.9),
      rec(item("b", "beach", "geo2"), 0.85),
      rec(item("c", "beach", "geo3"), 0.8), // 3rd beach — should be skipped in the capped pass
      rec(item("d", "hills", "geo4"), 0.75),
    ];
    const result = selectDiverse(scored, 3);
    const beachCount = result.filter((r) => r.item.categoryKey === "beach").length;
    expect(beachCount).toBeLessThanOrEqual(2);
    expect(result.map((r) => r.item.id)).toContain("d");
  });

  it("relaxes the cap to still fill all slots when the pool is too narrow (spec: don't force diversity on a narrow interest)", () => {
    const scored = [rec(item("a", "beach", "geo1"), 0.9), rec(item("b", "beach", "geo1"), 0.8), rec(item("c", "beach", "geo1"), 0.7), rec(item("d", "beach", "geo1"), 0.6)];
    const result = selectDiverse(scored, 4);
    expect(result).toHaveLength(4);
  });

  it("never returns duplicate ids even if the same item appears twice in the input", () => {
    const dup = item("a", "beach", "geo1");
    const scored = [rec(dup, 0.9), rec(dup, 0.9)];
    const result = selectDiverse(scored, 5);
    expect(result).toHaveLength(1);
  });

  it("respects a null categoryKey/geoKey as 'no grouping', never capping it", () => {
    const scored = Array.from({ length: 5 }, (_, i) => rec(item(`x${i}`, null, null), 0.9 - i * 0.01));
    const result = selectDiverse(scored, 5);
    expect(result).toHaveLength(5);
  });
});
