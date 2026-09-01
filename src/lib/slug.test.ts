import { describe, expect, it } from "vitest";
import { slugify, ensureUniqueSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Hornbill Festival")).toBe("hornbill-festival");
  });

  it("replaces & with 'and'", () => {
    expect(slugify("Arts & Music Festival")).toBe("arts-and-music-festival");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(slugify("Kerala!! Backwaters -- 2026")).toBe("kerala-backwaters-2026");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  Jaisalmer Fort  ")).toBe("jaisalmer-fort");
    expect(slugify("---weird---")).toBe("weird");
  });
});

describe("ensureUniqueSlug", () => {
  it("returns the plain slug when it's free", async () => {
    const slug = await ensureUniqueSlug("Hampi", async () => false);
    expect(slug).toBe("hampi");
  });

  it("appends -2, -3, ... until a free slug is found", async () => {
    const taken = new Set(["hampi", "hampi-2", "hampi-3"]);
    const slug = await ensureUniqueSlug("Hampi", async (candidate) => taken.has(candidate));
    expect(slug).toBe("hampi-4");
  });

  it("falls back to 'item' when the input has no usable characters", async () => {
    const slug = await ensureUniqueSlug("!!!", async () => false);
    expect(slug).toBe("item");
  });
});
