/**
 * Normalizes a search query for content-opportunity grouping (spec §10):
 * casing, surrounding/duplicate whitespace, and the most common trailing
 * punctuation are collapsed so "Ziro Music Festival", "ziro music festival ",
 * and "ziro  music  festival?" all group under one opportunity. Deliberately
 * NOT aggressive — no stemming, no synonym folding, no character transliteration
 * — the raw query (`rawQuery`) is kept alongside this for display, so a
 * human reviewing an opportunity always sees what was actually typed.
 */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[?!.,;:]+$/g, "");
}
