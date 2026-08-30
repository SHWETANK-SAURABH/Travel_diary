"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Skeleton } from "@/components/ui";
import { SaveButton, VisitedButton, AddToTripButton } from "@/components/discovery";
import { trackClientEvent } from "@/lib/analytics/client";
import type { DiscoveryPreview } from "@/app/api/map/discovery/route";

export interface SelectedDiscovery {
  id: string;
  kind: "festival" | "destination" | "experience" | "event";
  slug: string | null;
}

const DETAIL_HREF: Partial<Record<SelectedDiscovery["kind"], (slug: string) => string>> = {
  festival: (slug) => `/festivals/${slug}`,
  destination: (slug) => `/destinations/${slug}`,
};

export function DiscoveryPreviewPanel({ selected }: { selected: SelectedDiscovery }) {
  const identifier = selected.slug ?? selected.id;
  const { data, isLoading } = useQuery({
    queryKey: ["map-discovery", selected.kind, identifier],
    queryFn: async (): Promise<DiscoveryPreview> => {
      const res = await fetch(`/api/map/discovery?kind=${selected.kind}&identifier=${encodeURIComponent(identifier)}`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  if (isLoading || !data) {
    return (
      <div className="p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <Skeleton className="mt-4 h-16 w-full" />
      </div>
    );
  }

  const exploreHref = data.slug ? DETAIL_HREF[data.kind]?.(data.slug) : undefined;

  return (
    <div className="p-4">
      <Badge variant="neutral">{data.kind}</Badge>
      <h2 className="mt-2 text-h3 font-display">{data.name}</h2>
      {data.locationName && <p className="mt-1 text-caption text-ink-muted">{data.locationName}</p>}
      {data.dateLabel && <p className="mt-2 text-caption text-ink">{data.dateLabel}</p>}

      {data.description && (
        <p className="mt-3 text-body text-ink">
          {data.description.slice(0, 220)}
          {data.description.length > 220 ? "…" : ""}
        </p>
      )}

      {data.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <SaveButton kind={selected.kind} id={selected.id} size="sm" />
        <VisitedButton kind={selected.kind} id={selected.id} size="sm" />
        <AddToTripButton id={selected.id} size="sm" />
        {exploreHref && (
          <Link
            href={exploreHref}
            onClick={() =>
              trackClientEvent({ type: "MAP_INTERACTION", contentId: selected.id, metadata: { action: "explore_click" } })
            }
          >
            <Button size="sm">Explore</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
