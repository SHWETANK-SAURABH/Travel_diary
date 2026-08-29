import Link from "next/link";
import { Badge, ResponsiveImage } from "@/components/ui";
import { FestivalStatusBadge } from "./FestivalStatusBadge";
import type { FestivalDiscoveryItem } from "@/features/festivals/service";

/**
 * The lightweight discovery card: image, name, location, date — full stop.
 * Category/popularity only reveal on hover/focus (desktop) and stay
 * visible by default on touch (no hover) so the information isn't
 * unreachable on mobile — see the `sm:opacity-0` pattern below.
 */
export function FestivalCard({ festival }: { festival: FestivalDiscoveryItem }) {
  return (
    <Link href={`/festivals/${festival.slug}`} className="group block">
      {festival.imageUrl ? (
        <ResponsiveImage
          src={festival.imageUrl}
          alt={festival.name}
          containerClassName="rounded-t-lg"
          className="rounded-t-lg"
        />
      ) : (
        <div className="aspect-4/3 w-full rounded-t-lg bg-marigold-50" aria-hidden="true" />
      )}
      <div className="rounded-b-lg border border-t-0 border-border p-4 transition-shadow duration-base group-hover:shadow-panel">
        <p className="text-h3 font-display">{festival.name}</p>
        <p className="mt-1 text-caption text-ink-muted">{festival.location.name}</p>
        <p className="mt-1 text-caption text-ink">
          {festival.occurrence?.startDate
            ? festival.occurrence.startDate.toLocaleDateString("en-IN", { month: "long", day: "numeric" })
            : "Date not yet announced"}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5 opacity-100 transition-opacity duration-base sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <Badge variant="marigold">{festival.category.name}</Badge>
          {festival.popularity !== "POPULAR" && (
            <Badge variant="terracotta">{festival.popularity.replace("_", " ").toLowerCase()}</Badge>
          )}
          <FestivalStatusBadge status={festival.status} />
        </div>
      </div>
    </Link>
  );
}
