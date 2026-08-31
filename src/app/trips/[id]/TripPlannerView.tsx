"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Share2, Copy, Trash2 } from "lucide-react";
import { Button, Input, EmptyState, Badge } from "@/components/ui";
import { TripItemCard, TripMap, BudgetEstimate, TripSuggestions, type TripItemView } from "@/components/trips";
import type { TripBudgetEstimate, FestivalConflict, TripSuggestionItem } from "@/features/trips/types";

export interface TripMeta {
  name: string;
  startDate: string | null;
  endDate: string | null;
  days: number | null;
  travellerCount: number | null;
  estimatedBudget: number | null;
  locationName: string | null;
  visibility: "PRIVATE" | "UNLISTED" | "PUBLIC";
}

export interface TripPlannerViewProps {
  meta: TripMeta;
  items: TripItemView[];
  budgetEstimate?: TripBudgetEstimate;
  conflicts?: FestivalConflict[];
  suggestions?: TripSuggestionItem[];
  isGuest: boolean;
  onUpdateMeta: (patch: Partial<{ name: string; startDate: string; endDate: string; travellerCount: number; estimatedBudget: number; visibility: "PRIVATE" | "UNLISTED" | "PUBLIC" }>) => void;
  onAddDay: () => void;
  onRemoveDay: (day: number) => void;
  onRemoveItem: (itemId: string) => void;
  onMoveItemDay: (itemId: string, day: number) => void;
  onReorderDay: (day: number, orderedItemIds: string[]) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCopyShareLink?: () => void;
  shareCopied?: boolean;
}

/** Shared itinerary UI for both account and guest trips (spec §18/§51/§52) — desktop keeps a map beside the day list; mobile stacks day-by-day above a full-width map. */
export function TripPlannerView({
  meta,
  items,
  budgetEstimate,
  conflicts,
  suggestions,
  isGuest,
  onUpdateMeta,
  onAddDay,
  onRemoveDay,
  onRemoveItem,
  onMoveItemDay,
  onReorderDay,
  onDuplicate,
  onDelete,
  onCopyShareLink,
  shareCopied,
}: TripPlannerViewProps) {
  const [editingMeta, setEditingMeta] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const dayCount = Math.max(meta.days ?? 1, ...items.map((i) => i.day), 1);
  const dayNumbers = Array.from({ length: dayCount }, (_, i) => i + 1);
  const conflictByItem = useMemo(() => new Map((conflicts ?? []).map((c) => [c.tripItemId, c])), [conflicts]);

  const mapPoints = items
    .filter((i) => i.content?.latitude != null && i.content?.longitude != null)
    .map((i) => ({ id: i.id, name: i.content!.name, day: i.day, latitude: i.content!.latitude!, longitude: i.content!.longitude! }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {editingMeta ? (
              <MetaEditForm meta={meta} isGuest={isGuest} onSave={(patch) => { onUpdateMeta(patch); setEditingMeta(false); }} onCancel={() => setEditingMeta(false)} />
            ) : (
              <>
                <h1 className="text-h1 font-display">{meta.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-muted">
                  {meta.locationName && <span>{meta.locationName}</span>}
                  {meta.startDate && (
                    <span>
                      {new Date(meta.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      {meta.endDate ? ` – ${new Date(meta.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}` : ""}
                    </span>
                  )}
                  {meta.travellerCount && <span>{meta.travellerCount} traveller{meta.travellerCount === 1 ? "" : "s"}</span>}
                  {!isGuest && meta.visibility !== "PRIVATE" && <Badge variant="marigold">{meta.visibility === "PUBLIC" ? "Public" : "Unlisted"}</Badge>}
                </div>
              </>
            )}
          </div>

          {!editingMeta && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingMeta(true)}>
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={onDuplicate}>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Duplicate
              </Button>
              {onCopyShareLink && (
                <Button variant="outline" size="sm" onClick={onCopyShareLink}>
                  <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {shareCopied ? "Copied!" : "Share"}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm(`Delete "${meta.name}"? This can't be undone.`)) onDelete();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {budgetEstimate && (
          <div className="mt-4">
            <BudgetEstimate estimate={budgetEstimate} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6 lg:order-1">
          {dayNumbers.map((day) => {
            const dayItems = items.filter((i) => i.day === day).sort((a, b) => a.order - b.order);
            return (
              <div key={day}>
                <div className="flex items-center justify-between">
                  <h2 className="text-h3 font-display">Day {day}</h2>
                  {dayItems.length === 0 && dayNumbers.length > 1 && day === dayNumbers[dayNumbers.length - 1] && (
                    <button type="button" onClick={() => onRemoveDay(day)} className="text-caption text-ink-muted hover:text-ink">
                      Remove day
                    </button>
                  )}
                </div>

                {dayItems.length === 0 ? (
                  <EmptyState className="mt-2 py-8" title="Nothing planned yet." description="Add from Saved, explore nearby, or search for something to do." />
                ) : (
                  <div className="mt-2 flex flex-col gap-2">
                    {dayItems.map((item, index) => (
                      <TripItemCard
                        key={item.id}
                        item={item}
                        dayOptions={dayNumbers}
                        onRemove={() => onRemoveItem(item.id)}
                        onMoveDay={(newDay) => onMoveItemDay(item.id, newDay)}
                        canMoveUp={index > 0}
                        canMoveDown={index < dayItems.length - 1}
                        onMoveUp={() => {
                          const ids = dayItems.map((i) => i.id);
                          [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
                          onReorderDay(day, ids);
                        }}
                        onMoveDown={() => {
                          const ids = dayItems.map((i) => i.id);
                          [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
                          onReorderDay(day, ids);
                        }}
                        conflict={conflictByItem.get(item.id)}
                        selected={selectedItemId === item.id}
                        onSelect={() => setSelectedItemId(item.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Button variant="outline" onClick={onAddDay} className="self-start">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add day
          </Button>

          {suggestions && suggestions.length > 0 && <TripSuggestions items={suggestions} />}
        </div>

        <div className="h-80 overflow-hidden rounded-lg border border-border lg:sticky lg:top-20 lg:order-2 lg:h-[calc(100vh-6rem)]">
          <TripMap points={mapPoints} selectedId={selectedItemId} onSelect={setSelectedItemId} />
        </div>
      </div>

      <p className="text-caption text-ink-muted">
        Looking for somewhere to start? <Link href="/explore" className="text-marigold-600 hover:underline">Explore India</Link> or check your{" "}
        <Link href="/profile" className="text-marigold-600 hover:underline">saved places</Link>.
      </p>
    </div>
  );
}

function MetaEditForm({ meta, isGuest, onSave, onCancel }: { meta: TripMeta; isGuest: boolean; onSave: (patch: Record<string, unknown>) => void; onCancel: () => void }) {
  const [name, setName] = useState(meta.name);
  const [startDate, setStartDate] = useState(meta.startDate?.slice(0, 10) ?? "");
  const [endDate, setEndDate] = useState(meta.endDate?.slice(0, 10) ?? "");
  const [travellerCount, setTravellerCount] = useState(meta.travellerCount?.toString() ?? "");
  const [estimatedBudget, setEstimatedBudget] = useState(meta.estimatedBudget?.toString() ?? "");
  const [visibility, setVisibility] = useState(meta.visibility);

  return (
    <form
      className="flex max-w-md flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          name: name.trim() || meta.name,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          travellerCount: travellerCount ? Number(travellerCount) : undefined,
          estimatedBudget: estimatedBudget ? Number(estimatedBudget) : undefined,
          ...(isGuest ? {} : { visibility }),
        });
      }}
    >
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Trip name" />
      <div className="grid grid-cols-2 gap-2">
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" min={1} value={travellerCount} onChange={(e) => setTravellerCount(e.target.value)} placeholder="Travellers" />
        <Input type="number" min={0} value={estimatedBudget} onChange={(e) => setEstimatedBudget(e.target.value)} placeholder="Budget (₹)" />
      </div>
      {!isGuest && (
        <label className="flex flex-col gap-1 text-sm text-ink">
          Visibility
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as TripMeta["visibility"])}
            className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-marigold-500"
          >
            <option value="PRIVATE">Private — only you</option>
            <option value="UNLISTED">Unlisted — anyone with the link</option>
            <option value="PUBLIC">Public — anyone with the link</option>
          </select>
        </label>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
