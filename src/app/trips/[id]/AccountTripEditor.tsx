"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { TripVisibility } from "@prisma/client";
import { TripPlannerView, type TripMeta } from "./TripPlannerView";
import type { TripItemView } from "@/components/trips";
import type { TripBudgetEstimate, FestivalConflict, TripSuggestionItem } from "@/features/trips/types";
import { applyDayCountDelta } from "@/lib/trip/duration";

export interface AccountTripEditorProps {
  tripId: string;
  initialMeta: TripMeta;
  initialItems: TripItemView[];
  initialBudget: TripBudgetEstimate;
  initialConflicts: FestivalConflict[];
  initialSuggestions: TripSuggestionItem[];
}

interface TripDetailResponse {
  trip: {
    name: string;
    startDate: string | null;
    endDate: string | null;
    days: number | null;
    travellerCount: number | null;
    estimatedBudget: number | null;
    visibility: TripVisibility;
    locationName: string | null;
  };
  items: TripItemView[];
  budget: TripBudgetEstimate;
  conflicts: FestivalConflict[];
  suggestions: TripSuggestionItem[];
}

/**
 * The account-trip half of the itinerary editor: every mutation hits the
 * API, then — except reordering, which never changes budget/conflicts/
 * suggestions and would otherwise mean a full refetch on every drag/click
 * (spec §49) — pulls a fresh `GET /api/trips/[id]` so those heuristics stay
 * correct after anything that could actually move the numbers (add/remove
 * item, change dates, change day count).
 */
export function AccountTripEditor({ tripId, initialMeta, initialItems, initialBudget, initialConflicts, initialSuggestions }: AccountTripEditorProps) {
  const router = useRouter();
  const [meta, setMeta] = useState(initialMeta);
  const [items, setItems] = useState(initialItems);
  const [budget, setBudget] = useState(initialBudget);
  const [conflicts, setConflicts] = useState(initialConflicts);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [shareCopied, setShareCopied] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/trips/${tripId}`);
    if (!res.ok) return;
    const data = (await res.json()) as TripDetailResponse;
    setMeta({
      name: data.trip.name,
      startDate: data.trip.startDate,
      endDate: data.trip.endDate,
      days: data.trip.days,
      travellerCount: data.trip.travellerCount,
      estimatedBudget: data.trip.estimatedBudget,
      locationName: data.trip.locationName,
      visibility: data.trip.visibility,
    });
    setItems(data.items);
    setBudget(data.budget);
    setConflicts(data.conflicts);
    setSuggestions(data.suggestions);
  }, [tripId]);

  async function handleUpdateMeta(patch: Record<string, unknown>) {
    await fetch(`/api/trips/${tripId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    await refresh();
  }

  async function handleAddDay() {
    await handleUpdateMeta(applyDayCountDelta(meta.startDate, meta.endDate, meta.days, 1));
  }

  async function handleRemoveDay() {
    await handleUpdateMeta(applyDayCountDelta(meta.startDate, meta.endDate, meta.days, -1));
  }

  async function handleRemoveItem(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await fetch(`/api/trips/${tripId}/items/${itemId}`, { method: "DELETE" });
    await refresh();
  }

  async function handleMoveItemDay(itemId: string, day: number) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, day } : i)));
    await fetch(`/api/trips/${tripId}/items/${itemId}/move`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ day }) });
    await refresh();
  }

  function handleReorderDay(day: number, orderedItemIds: string[]) {
    const order = new Map(orderedItemIds.map((id, index) => [id, index]));
    setItems((prev) => prev.map((i) => (i.day === day && order.has(i.id) ? { ...i, order: order.get(i.id)! } : i)));
    void fetch(`/api/trips/${tripId}/items/reorder`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ day, orderedItemIds }) });
  }

  async function handleDuplicate() {
    const res = await fetch(`/api/trips/${tripId}/duplicate`, { method: "POST" });
    const data = (await res.json()) as { trip: { id: string } };
    router.push(`/trips/${data.trip.id}`);
  }

  async function handleDelete() {
    await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
    router.push("/trips");
  }

  async function handleCopyShareLink() {
    if (meta.visibility === "PRIVATE") {
      await handleUpdateMeta({ visibility: "UNLISTED" });
    }
    await navigator.clipboard.writeText(`${window.location.origin}/trips/${tripId}/share`);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }

  return (
    <TripPlannerView
      meta={meta}
      items={items}
      budgetEstimate={budget}
      conflicts={conflicts}
      suggestions={suggestions}
      isGuest={false}
      onUpdateMeta={handleUpdateMeta}
      onAddDay={handleAddDay}
      onRemoveDay={handleRemoveDay}
      onRemoveItem={handleRemoveItem}
      onMoveItemDay={handleMoveItemDay}
      onReorderDay={handleReorderDay}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      onCopyShareLink={handleCopyShareLink}
      shareCopied={shareCopied}
    />
  );
}
