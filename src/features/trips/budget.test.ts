import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    destination: { findMany: vi.fn() },
  },
}));

const { db } = await import("@/lib/db");
const { estimateTripBudget } = await import("./service");

describe("estimateTripBudget", () => {
  beforeEach(() => {
    vi.mocked(db.destination.findMany).mockReset();
  });

  it("returns hasData: false when the trip has no destination items", async () => {
    const result = await estimateTripBudget({ days: 5, travellerCount: 2, items: [{ contentType: "FESTIVAL", contentId: "f1" }] });
    expect(result).toEqual({ low: 0, high: 0, hasData: false });
  });

  it("returns hasData: false when destinations exist but none has cost data", async () => {
    vi.mocked(db.destination.findMany).mockResolvedValue([{ approximateCostPerDay: null }] as never);
    const result = await estimateTripBudget({ days: 5, travellerCount: 1, items: [{ contentType: "DESTINATION", contentId: "d1" }] });
    expect(result.hasData).toBe(false);
  });

  it("computes a ±20% range around avgCostPerDay × days × travellers", async () => {
    vi.mocked(db.destination.findMany).mockResolvedValue([{ approximateCostPerDay: 2000 }] as never);
    const result = await estimateTripBudget({ days: 5, travellerCount: 2, items: [{ contentType: "DESTINATION", contentId: "d1" }] });
    // base = 2000 * 5 * 2 = 20000; range = 16000..24000
    expect(result).toEqual({ low: 16000, high: 24000, hasData: true });
  });

  it("averages cost across multiple destinations", async () => {
    vi.mocked(db.destination.findMany).mockResolvedValue([{ approximateCostPerDay: 1000 }, { approximateCostPerDay: 3000 }] as never);
    const result = await estimateTripBudget({ days: 1, travellerCount: 1, items: [{ contentType: "DESTINATION", contentId: "d1" }, { contentType: "DESTINATION", contentId: "d2" }] });
    // avg = 2000; base = 2000
    expect(result).toEqual({ low: 1600, high: 2400, hasData: true });
  });

  it("defaults days/travellers to 1 when not set on the trip", async () => {
    vi.mocked(db.destination.findMany).mockResolvedValue([{ approximateCostPerDay: 1000 }] as never);
    const result = await estimateTripBudget({ days: null, travellerCount: null, items: [{ contentType: "DESTINATION", contentId: "d1" }] });
    expect(result).toEqual({ low: 800, high: 1200, hasData: true });
  });
});
