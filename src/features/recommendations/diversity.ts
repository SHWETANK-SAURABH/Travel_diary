import type { Recommendation } from "./types";

export interface DiversityKeys {
  id: string;
  categoryKey: string | null;
  geoKey: string | null;
}

/**
 * Greedy top-N selection: highest score first, but skips a candidate that
 * would push its category or geographic group past a soft cap of 2 — spec
 * §28/§29 ("avoid returning five nearly identical destinations... from the
 * same small geographic region") — then relaxes that cap in a second pass
 * to still fill all `count` slots when the candidate pool is too narrow
 * (spec §28: "do not force diversity when the user's interests are
 * extremely narrow"). Also the single place duplicates are dropped (§30).
 */
export function selectDiverse<T extends DiversityKeys>(scored: Recommendation<T>[], count = 5): Recommendation<T>[] {
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const picked: Recommendation<T>[] = [];
  const seen = new Set<string>();
  const categoryCounts = new Map<string, number>();
  const geoCounts = new Map<string, number>();
  const SOFT_CAP = 2;

  function pass(enforceCap: boolean) {
    for (const candidate of sorted) {
      if (picked.length >= count) return;
      const { id, categoryKey, geoKey } = candidate.item;
      if (seen.has(id)) continue;

      if (enforceCap) {
        const catCount = categoryKey ? (categoryCounts.get(categoryKey) ?? 0) : 0;
        const geoCount = geoKey ? (geoCounts.get(geoKey) ?? 0) : 0;
        if (catCount >= SOFT_CAP || geoCount >= SOFT_CAP) continue;
      }

      picked.push(candidate);
      seen.add(id);
      if (categoryKey) categoryCounts.set(categoryKey, (categoryCounts.get(categoryKey) ?? 0) + 1);
      if (geoKey) geoCounts.set(geoKey, (geoCounts.get(geoKey) ?? 0) + 1);
    }
  }

  pass(true);
  if (picked.length < count) pass(false);
  return picked.slice(0, count);
}
