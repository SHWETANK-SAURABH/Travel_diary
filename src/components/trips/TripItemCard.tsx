"use client";

import Link from "next/link";
import { ArrowUp, ArrowDown, X, MapPin, AlertTriangle, HelpCircle } from "lucide-react";
import { ResponsiveImage } from "@/components/ui";
import { CONTENT_TYPE_LABEL } from "@/components/discovery/contentKind";
import type { FestivalConflictStatus } from "@/features/trips/types";
import type { TripItemView } from "./types";

export interface TripItemCardProps {
  item: TripItemView;
  dayOptions: number[];
  onRemove: () => void;
  onMoveDay: (day: number) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  conflict?: { status: FestivalConflictStatus; festivalName: string };
  selected?: boolean;
  onSelect?: () => void;
}

const CONFLICT_MESSAGE: Partial<Record<FestivalConflictStatus, string>> = {
  CONFIRMED_CONFLICT: "This festival is outside your current trip dates.",
  UNCERTAIN: "Festival dates are not confirmed yet — this may or may not fall within your trip.",
};

/** Compact by design (spec §19/§52): image, name, type, location, remove, accessible move controls (no drag-and-drop required — spec §13/§53), map focus. */
export function TripItemCard({ item, dayOptions, onRemove, onMoveDay, onMoveUp, onMoveDown, canMoveUp, canMoveDown, conflict, selected, onSelect }: TripItemCardProps) {
  const conflictMessage = conflict ? CONFLICT_MESSAGE[conflict.status] : undefined;

  if (!item.content) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-border p-3">
        <p className="text-caption text-ink-muted">This discovery is no longer available.</p>
        <button type="button" onClick={onRemove} aria-label="Remove item" className="text-ink-muted hover:text-ink">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  const { content } = item;

  return (
    <div className={`rounded-md border p-3 ${selected ? "border-marigold-500 bg-marigold-50/50" : "border-border"}`}>
      <div className="flex items-start gap-3">
        <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-start gap-3 text-left" aria-label={`Focus ${content.name} on map`}>
          {content.imageUrl ? (
            <ResponsiveImage src={content.imageUrl} alt="" aspectRatio="1/1" containerClassName="h-14 w-14 shrink-0 rounded-md" className="rounded-md" sizes="56px" />
          ) : (
            <div className="h-14 w-14 shrink-0 rounded-md bg-marigold-50" aria-hidden="true" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{content.name}</p>
            <p className="truncate text-caption text-ink-muted">
              {CONTENT_TYPE_LABEL[content.contentType]}
              {content.locationName ? ` · ${content.locationName}` : ""}
            </p>
            {item.notes && <p className="mt-1 truncate text-caption text-ink-muted italic">{item.notes}</p>}
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onMoveUp} disabled={!canMoveUp} aria-label="Move up" className="rounded p-1 text-ink-muted hover:bg-marigold-50 hover:text-ink disabled:opacity-30">
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button type="button" onClick={onMoveDown} disabled={!canMoveDown} aria-label="Move down" className="rounded p-1 text-ink-muted hover:bg-marigold-50 hover:text-ink disabled:opacity-30">
            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button type="button" onClick={onRemove} aria-label={`Remove ${content.name} from trip`} className="rounded p-1 text-ink-muted hover:bg-marigold-50 hover:text-ink">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {content.href && (
          <Link href={content.href} className="inline-flex items-center gap-1 text-caption text-marigold-600 hover:underline">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            View details
          </Link>
        )}
        <label className="flex items-center gap-1.5 text-caption text-ink-muted">
          Day
          <select
            value={item.day}
            onChange={(e) => onMoveDay(Number(e.target.value))}
            className="h-7 rounded border border-border bg-paper-raised px-1.5 text-caption text-ink focus-visible:outline-2 focus-visible:outline-marigold-500"
          >
            {dayOptions.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </label>
      </div>

      {conflictMessage && (
        <div className="mt-2 flex items-start gap-1.5 rounded bg-terracotta-500/10 px-2 py-1.5 text-caption text-terracotta-500">
          {conflict?.status === "CONFIRMED_CONFLICT" ? (
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          {conflictMessage}
        </div>
      )}
    </div>
  );
}
