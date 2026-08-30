import Link from "next/link";
import { Badge, ResponsiveImage } from "@/components/ui";
import { isInSeason } from "@/features/destinations/seasonal";
import { BudgetBadge } from "./BudgetBadge";
import type { DestinationDiscoveryItem } from "@/features/destinations/service";

/**
 * The lightweight discovery card: image, name, state/region, budget,
 * seasonal indicator. Category/popularity reveal on hover/focus (desktop)
 * and stay visible on touch — same pattern as FestivalCard.
 */
export function DestinationCard({ destination }: { destination: DestinationDiscoveryItem }) {
  const inSeason = isInSeason(destination);

  return (
    <Link href={`/destinations/${destination.slug}`} className="group block">
      {destination.imageUrl ? (
        <ResponsiveImage
          src={destination.imageUrl}
          alt={destination.name}
          containerClassName="rounded-t-lg"
          className="rounded-t-lg"
        />
      ) : (
        <div className="aspect-4/3 w-full rounded-t-lg bg-marigold-50" aria-hidden="true" />
      )}
      <div className="rounded-b-lg border border-t-0 border-border p-4 transition-shadow duration-base group-hover:shadow-panel">
        <p className="text-h3 font-display">{destination.name}</p>
        <p className="mt-1 text-caption text-ink-muted">{destination.location.name}</p>
        {inSeason && <p className="mt-1 text-caption text-success">Good time to visit</p>}

        <div className="mt-3 flex flex-wrap gap-1.5 opacity-100 transition-opacity duration-base sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          {destination.category && <Badge variant="marigold">{destination.category.name}</Badge>}
          {destination.budgetLevel && <BudgetBadge level={destination.budgetLevel} />}
          {destination.popularity === "HIDDEN" && <Badge variant="terracotta">hidden gem</Badge>}
        </div>
      </div>
    </Link>
  );
}
