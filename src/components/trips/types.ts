import type { ResolvedContentItem } from "@/lib/content/resolve";

/** The UI-normalized shape every trip item is rendered from, regardless of whether it came from a server Trip or a guest's local draft. */
export interface TripItemView {
  id: string;
  day: number;
  order: number;
  notes: string | null;
  /** Null when the referenced content has been deleted (spec §55) — the card shows "no longer available" and only offers Remove. */
  content: ResolvedContentItem | null;
}
