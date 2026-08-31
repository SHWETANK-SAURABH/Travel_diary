"use client";

import Link from "next/link";
import { useGuestStore } from "@/lib/guest/store";
import { useHasHydrated } from "@/lib/hooks/useHasHydrated";
import { EmptyState, Button, SkeletonCard } from "@/components/ui";
import { TripCard } from "@/components/trips";

/**
 * The guest half of `/trips` — reads entirely from localStorage, so it can
 * only ever render client-side. Gated on `useHasHydrated()` (same fix as
 * Phase 8's SaveButton/VisitedButton — see its docstring): the store starts
 * empty on every render until this component's own effect confirms
 * hydration, so there's no server/client mismatch to reproduce here.
 */
export function GuestTripsList() {
  const hasHydrated = useHasHydrated();
  const trips = useGuestStore((s) => s.trips);
  const duplicateTrip = useGuestStore((s) => s.duplicateTrip);
  const removeTrip = useGuestStore((s) => s.removeTrip);

  if (!hasHydrated) {
    return (
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <EmptyState
        className="mt-8"
        title="Your next adventure starts here."
        description="Create a trip to start building your itinerary — no account needed."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/trips/new">
              <Button>Create a trip</Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline">Explore India</Button>
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <TripCard
          key={trip.localId}
          trip={{
            id: trip.localId,
            name: trip.name,
            locationName: null,
            startDate: trip.startDate ?? null,
            endDate: trip.endDate ?? null,
            days: trip.days ?? null,
            itemCount: trip.items.length,
            estimatedBudget: trip.estimatedBudget ?? null,
            updatedAt: trip.updatedAt,
          }}
          onDuplicate={() => duplicateTrip(trip.localId)}
          onDelete={() => {
            if (confirm(`Delete "${trip.name}"? This can't be undone.`)) removeTrip(trip.localId);
          }}
        />
      ))}
    </div>
  );
}
