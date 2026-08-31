"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Check } from "lucide-react";
import { Button, Input, type ButtonProps } from "@/components/ui";
import { useGuestStore } from "@/lib/guest/store";
import { trackClientEvent } from "@/lib/analytics/client";
import { KIND_TO_CONTENT_TYPE, type DiscoveryKind } from "./contentKind";

interface TripOption {
  id: string;
  name: string;
}

/**
 * The real "Add to Trip" flow (spec §14): existing trips to add to, or
 * create one inline — guests write straight to the local store, signed-in
 * users hit the trip API, both add the item to Day 1 (the user reorganizes
 * from there in the trip editor, keeping this a one-click action rather
 * than asking "which day?" up front — spec §2's "low friction").
 */
export function AddToTripButton({ kind, id, size = "md", source }: { kind: DiscoveryKind; id: string; size?: ButtonProps["size"]; source?: string }) {
  const { data: session } = useSession();
  const contentType = KIND_TO_CONTENT_TYPE[kind];
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [added, setAdded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const guestTrips = useGuestStore((s) => s.trips);
  const guestAddTripItem = useGuestStore((s) => s.addTripItem);
  const guestCreateTrip = useGuestStore((s) => s.createTrip);

  const { data: accountTrips } = useQuery({
    queryKey: ["trips-list"],
    queryFn: async () => {
      const res = await fetch("/api/trips");
      const data = (await res.json()) as { trips: TripOption[] };
      return data.trips;
    },
    enabled: !!session,
  });

  const trips: TripOption[] = session ? (accountTrips ?? []) : guestTrips.map((t) => ({ id: t.localId, name: t.name }));

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setCreating(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function addToTrip(tripId: string) {
    if (session) {
      await fetch(`/api/trips/${tripId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: 1, contentType, contentId: id }),
      });
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
    } else {
      guestAddTripItem(tripId, { day: 1, contentType, contentId: id });
    }
    setAdded(true);
    setOpen(false);
    trackClientEvent({ type: "ADD_TO_TRIP", contentType, contentId: id, metadata: { tripId, source } });
  }

  async function handleCreateAndAdd() {
    const name = newTripName.trim();
    if (!name) return;

    let tripId: string;
    if (session) {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json()) as { trip: { id: string } };
      tripId = data.trip.id;
      queryClient.invalidateQueries({ queryKey: ["trips-list"] });
    } else {
      tripId = guestCreateTrip({ name });
    }

    await addToTrip(tripId);
    setNewTripName("");
    setCreating(false);
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <Button
        size={size}
        variant={added ? "secondary" : "outline"}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {added ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
        {added ? "Added" : "Add to Trip"}
      </Button>

      {open && (
        <div role="menu" className="animate-scale-in absolute top-full left-0 z-20 mt-1 w-64 origin-top rounded-md border border-border bg-paper-raised p-2 shadow-panel">
          {trips.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <p className="px-2 py-1 text-label font-medium tracking-wide text-ink-muted uppercase">Add to existing trip</p>
              <div className="max-h-40 overflow-y-auto">
                {trips.map((trip) => (
                  <button key={trip.id} type="button" role="menuitem" onClick={() => void addToTrip(trip.id)} className="block w-full truncate rounded px-2 py-1.5 text-left text-sm text-ink hover:bg-marigold-50">
                    {trip.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {creating ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleCreateAndAdd();
              }}
              className="mt-1 flex flex-col gap-2 border-t border-border p-1 pt-2"
            >
              <Input autoFocus value={newTripName} onChange={(e) => setNewTripName(e.target.value)} placeholder="Trip name" className="h-8 text-sm" />
              <div className="flex gap-1.5">
                <Button type="submit" size="sm">
                  Create &amp; Add
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setCreating(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className={`w-full rounded px-2 py-1.5 text-left text-sm text-marigold-600 hover:bg-marigold-50 ${trips.length > 0 ? "mt-1 border-t border-border pt-2" : ""}`}
            >
              + Create a trip
            </button>
          )}
        </div>
      )}
    </div>
  );
}
