"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button, Skeleton } from "@/components/ui";
import type { StateSummary } from "@/features/map/types";

export interface StatePanelProps {
  stateSlug: string;
  month: number | null;
}

export function StatePanel({ stateSlug, month }: StatePanelProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["map-state", stateSlug, month],
    queryFn: async (): Promise<StateSummary> => {
      const url = month ? `/api/map/state/${stateSlug}?month=${month}` : `/api/map/state/${stateSlug}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  if (isLoading || !data) {
    return (
      <div className="p-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="mt-3 h-4 w-2/3" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <p className="text-label font-medium tracking-wide text-marigold-600 uppercase">{data.name}</p>
      <dl className="mt-3 space-y-1 text-body">
        <div className="flex justify-between">
          <dt className="text-ink-muted">
            {month ? "Festivals this month" : "Festivals"}
          </dt>
          <dd>{data.festivalCount}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Destinations</dt>
          <dd>{data.destinationCount}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Hidden gems</dt>
          <dd>{data.hiddenCount}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/festivals?state=${data.slug}`}>
          <Button size="sm" variant="outline">
            Explore festivals
          </Button>
        </Link>
        <Link href={`/destinations?state=${data.slug}`}>
          <Button size="sm" variant="outline">
            Explore destinations
          </Button>
        </Link>
      </div>
    </div>
  );
}
