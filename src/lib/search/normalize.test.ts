import { describe, expect, it } from "vitest";
import { normalizeQuery } from "./normalize";

describe("normalizeQuery", () => {
  it("lowercases", () => {
    expect(normalizeQuery("Ziro Music Festival")).toBe("ziro music festival");
  });

  it("trims and collapses internal whitespace", () => {
    expect(normalizeQuery("  ziro   music  festival  ")).toBe("ziro music festival");
  });

  it("strips trailing punctuation", () => {
    expect(normalizeQuery("ziro music festival?")).toBe("ziro music festival");
    expect(normalizeQuery("ziro music festival!!")).toBe("ziro music festival");
  });

  it("groups casing/whitespace/punctuation variants to the same key", () => {
    const variants = ["Ziro Music Festival", "ziro music festival ", "ziro  music  festival?"];
    const normalized = new Set(variants.map(normalizeQuery));
    expect(normalized.size).toBe(1);
  });

  it("does not stem or otherwise rewrite the query beyond casing/whitespace/punctuation", () => {
    expect(normalizeQuery("Festivals in Kerala")).toBe("festivals in kerala");
  });
});
