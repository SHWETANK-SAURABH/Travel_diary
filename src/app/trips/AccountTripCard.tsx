"use client";

import { useRouter } from "next/navigation";
import { TripCard, type TripSummaryView } from "@/components/trips";
import { trackClientEvent } from "@/lib/analytics/client";

/** Wraps the shared TripCard with real API-backed Duplicate/Delete for an authenticated user's trip, refreshing the server-rendered list afterward. */
export function AccountTripCard({ trip }: { trip: TripSummaryView }) {
  const router = useRouter();

  async function handleDuplicate() {
    await fetch(`/api/trips/${trip.id}/duplicate`, { method: "POST" });
    trackClientEvent({ type: "TRIP_INTERACTION", contentId: trip.id, metadata: { action: "duplicated" } });
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${trip.name}"? This can't be undone.`)) return;
    await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
    trackClientEvent({ type: "TRIP_INTERACTION", contentId: trip.id, metadata: { action: "deleted" } });
    router.refresh();
  }

  return <TripCard trip={trip} onDuplicate={handleDuplicate} onDelete={handleDelete} />;
}
