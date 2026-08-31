import Link from "next/link";
import { AddToTripButton } from "@/components/discovery";
import type { TripSuggestionItem } from "@/features/trips/types";

export type { TripSuggestionItem };

const HREF_BASE: Record<TripSuggestionItem["kind"], string> = {
  destination: "/destinations",
  festival: "/festivals",
};

/** "Near your plans" (spec §29/§32) — never adds anything automatically, just surfaces it with the same one-click Add to Trip everywhere else uses. */
export function TripSuggestions({ items }: { items: TripSuggestionItem[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-h3 font-display">You might also like</h3>
      <p className="text-caption text-ink-muted">Nearby your planned stops.</p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-2 rounded-md border border-border p-3">
            <Link href={`${HREF_BASE[item.kind]}/${item.slug}`} className="min-w-0 truncate text-sm text-ink hover:text-marigold-600">
              {item.name}
            </Link>
            <AddToTripButton kind={item.kind} id={item.id} size="sm" source="trip_suggestions" />
          </div>
        ))}
      </div>
    </div>
  );
}
