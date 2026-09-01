"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useGuestStore } from "@/lib/guest/store";
import { useHasHydrated } from "@/lib/hooks/useHasHydrated";
import { EmptyState, Button, Skeleton } from "@/components/ui";
import type { TripItemView } from "@/components/trips";
import type { ResolvedContentItem } from "@/lib/content/resolve";
import type { TripBudgetEstimate, FestivalConflict, TripSuggestionItem } from "@/features/trips/types";
import { applyDayCountDelta } from "@/lib/trip/duration";
import { trackClientEvent } from "@/lib/analytics/client";
import { TripPlannerView, type TripMeta } from "./TripPlannerView";

interface TripInsightsResponse {
  budget: TripBudgetEstimate;
  conflicts: FestivalConflict[];
  suggestions: TripSuggestionItem[];
}

/**
 * The guest half of the itinerary editor: the trip lives entirely in
 * localStorage, so budget/conflicts/suggestions (which need destination
 * cost data, festival dates, geo-proximity — none of which the browser can
 * look up on its own) come from two no-auth endpoints instead of a Trip row
 * — /api/trips/resolve (Phase 9's existing content resolver) and
 * /api/trips/insights (new, mirrors what GET /api/trips/[id] computes for
 * an account trip). Re-fetched whenever the itinerary's content/dates
 * actually change, keyed on a content signature rather than the whole
 * object so a pure reorder doesn't refetch either.
 */
export function GuestTripEditor({ tripId }: { tripId: string }) {
  const hasHydrated = useHasHydrated();
  const router = useRouter();
  const trip = useGuestStore((s) => s.trips.find((t) => t.localId === tripId));
  const updateTripMeta = useGuestStore((s) => s.updateTripMeta);
  const removeTrip = useGuestStore((s) => s.removeTrip);
  const duplicateTrip = useGuestStore((s) => s.duplicateTrip);
  const removeTripItem = useGuestStore((s) => s.removeTripItem);
  const moveTripItemToDay = useGuestStore((s) => s.moveTripItemToDay);
  const reorderTripItemsInDay = useGuestStore((s) => s.reorderTripItemsInDay);

  const contentSignature = trip ? JSON.stringify(trip.items.map((i) => [i.contentType, i.contentId])) : "";

  const { data: resolvedItems } = useQuery({
    queryKey: ["guest-trip-resolve", tripId, contentSignature],
    queryFn: async () => {
      const withContent = (trip?.items ?? [])
        .filter((i) => i.contentType && i.contentId)
        .map((i) => ({ contentType: i.contentType!, contentId: i.contentId! }));
      if (withContent.length === 0) return [] as ResolvedContentItem[];
      const res = await fetch("/api/trips/resolve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: withContent }) });
      const data = (await res.json()) as { items: ResolvedContentItem[] };
      return data.items;
    },
    enabled: hasHydrated && !!trip,
  });

  const { data: insights } = useQuery({
    queryKey: ["guest-trip-insights", tripId, contentSignature, trip?.startDate, trip?.endDate, trip?.days, trip?.travellerCount],
    queryFn: async () => {
      const res = await fetch("/api/trips/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: trip?.startDate,
          endDate: trip?.endDate,
          days: trip?.days,
          travellerCount: trip?.travellerCount,
          items: (trip?.items ?? []).map((i) => ({ id: i.id, contentType: i.contentType, contentId: i.contentId })),
        }),
      });
      return (await res.json()) as TripInsightsResponse;
    },
    enabled: hasHydrated && !!trip,
  });

  const items: TripItemView[] = useMemo(() => {
    if (!trip) return [];
    const byKey = new Map((resolvedItems ?? []).map((r) => [`${r.contentType}:${r.id}`, r]));
    return trip.items.map((i) => ({
      id: i.id,
      day: i.day,
      order: i.order,
      notes: i.notes ?? null,
      content: i.contentType && i.contentId ? (byKey.get(`${i.contentType}:${i.contentId}`) ?? null) : null,
    }));
  }, [trip, resolvedItems]);

  const hasTrackedOpen = useRef(false);
  useEffect(() => {
    if (hasTrackedOpen.current || !hasHydrated || !trip) return;
    hasTrackedOpen.current = true;
    trackClientEvent({ type: "TRIP_INTERACTION", contentId: tripId, metadata: { action: "opened", guest: true } });
  }, [hasHydrated, trip, tripId]);

  if (!hasHydrated) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!trip) {
    return (
      <EmptyState
        title="Trip not found."
        description="It may have been removed, or this link belongs to a different browser or device."
        action={
          <Link href="/trips">
            <Button variant="outline">Back to your trips</Button>
          </Link>
        }
      />
    );
  }

  const meta: TripMeta = {
    name: trip.name,
    startDate: trip.startDate ?? null,
    endDate: trip.endDate ?? null,
    days: trip.days ?? null,
    travellerCount: trip.travellerCount ?? null,
    estimatedBudget: trip.estimatedBudget ?? null,
    locationName: null,
    visibility: "PRIVATE",
  };

  return (
    <TripPlannerView
      meta={meta}
      items={items}
      budgetEstimate={insights?.budget}
      conflicts={insights?.conflicts}
      suggestions={insights?.suggestions}
      isGuest
      onUpdateMeta={(patch) => updateTripMeta(tripId, patch)}
      onAddDay={() => updateTripMeta(tripId, applyDayCountDelta(trip.startDate, trip.endDate, trip.days, 1))}
      onRemoveDay={() => updateTripMeta(tripId, applyDayCountDelta(trip.startDate, trip.endDate, trip.days, -1))}
      onRemoveItem={(itemId) => {
        removeTripItem(tripId, itemId);
        trackClientEvent({ type: "TRIP_INTERACTION", contentId: tripId, metadata: { action: "item_removed", itemId, guest: true } });
      }}
      onMoveItemDay={(itemId, day) => {
        moveTripItemToDay(tripId, itemId, day);
        trackClientEvent({ type: "TRIP_INTERACTION", contentId: tripId, metadata: { action: "day_changed", guest: true } });
      }}
      onReorderDay={(day, orderedItemIds) => {
        reorderTripItemsInDay(tripId, day, orderedItemIds);
        trackClientEvent({ type: "TRIP_INTERACTION", contentId: tripId, metadata: { action: "item_reordered", guest: true } });
      }}
      onDuplicate={() => {
        const newId = duplicateTrip(tripId);
        if (newId) router.push(`/trips/${newId}`);
      }}
      onDelete={() => {
        removeTrip(tripId);
        router.push("/trips");
      }}
    />
  );
}
