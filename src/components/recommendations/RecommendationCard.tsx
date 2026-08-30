"use client";

import { Check } from "lucide-react";
import { Badge, Button, ResponsiveImage } from "@/components/ui";
import { SaveButton, AddToTripButton, TrackedLink } from "@/components/discovery";
import type { DiscoveryKind } from "@/components/discovery/contentKind";

export interface RecommendationCardProps {
  kind: Extract<DiscoveryKind, "festival" | "destination">;
  id: string;
  slug: string;
  name: string;
  locationName: string;
  imageUrl: string | null;
  /** Null for the anonymous/cold-start fallback — never a fabricated percentage (spec §22/§45). */
  matchPercent: number | null;
  reasons: string[];
  context: string;
}

const CONTENT_TYPE: Record<RecommendationCardProps["kind"], "FESTIVAL" | "DESTINATION"> = {
  festival: "FESTIVAL",
  destination: "DESTINATION",
};

/** image, name, location, match score, 2-4 reasons, Save/Explore/Add to Trip — spec §23, deliberately not overloaded. */
export function RecommendationCard({ kind, id, slug, name, locationName, imageUrl, matchPercent, reasons, context }: RecommendationCardProps) {
  const href = `/${kind === "festival" ? "festivals" : "destinations"}/${slug}`;
  const clickEvent = { type: "RECOMMENDATION_CLICK" as const, contentType: CONTENT_TYPE[kind], contentId: id, metadata: { context } };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border">
      <TrackedLink href={href} event={clickEvent} className="block">
        {imageUrl ? (
          <ResponsiveImage src={imageUrl} alt={name} />
        ) : (
          <div className="aspect-4/3 w-full bg-marigold-50" aria-hidden="true" />
        )}
      </TrackedLink>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <TrackedLink href={href} event={clickEvent}>
              <p className="text-h3 font-display hover:text-marigold-600">{name}</p>
            </TrackedLink>
            <p className="text-caption text-ink-muted">{locationName}</p>
          </div>
          {matchPercent != null && (
            <Badge variant="marigold" className="shrink-0">
              {matchPercent}% match
            </Badge>
          )}
        </div>

        {reasons.length > 0 && (
          <ul className="flex flex-col gap-1">
            {reasons.slice(0, 4).map((reason) => (
              <li key={reason} className="flex items-center gap-1.5 text-caption text-ink">
                <Check className="h-3 w-3 shrink-0 text-success" aria-hidden="true" />
                {reason}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <SaveButton kind={kind} id={id} size="sm" source={context} />
          <AddToTripButton id={id} size="sm" source={context} />
          <TrackedLink href={href} event={clickEvent}>
            <Button variant="ghost" size="sm">
              Explore
            </Button>
          </TrackedLink>
        </div>
      </div>
    </div>
  );
}
