"use client";

import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui";

export interface TripSummaryView {
  id: string;
  name: string;
  locationName: string | null;
  startDate: string | null;
  endDate: string | null;
  days: number | null;
  itemCount: number;
  estimatedBudget: number | null;
  updatedAt: string;
}

function formatDateRange(startDate: string | null, endDate: string | null): string | null {
  if (!startDate) return null;
  const start = new Date(startDate);
  const startLabel = start.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  if (!endDate) return startLabel;
  const end = new Date(endDate);
  return `${startLabel} – ${end.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}`;
}

/** The trip dashboard's card (spec §6) — name, region, dates, day/item counts, budget, last updated, plus Open/Duplicate/Delete. Kept intentionally light; "Edit" happens on the trip page itself, not a separate flow. */
export function TripCard({ trip, onDuplicate, onDelete }: { trip: TripSummaryView; onDuplicate: () => void; onDelete: () => void }) {
  const dateRange = formatDateRange(trip.startDate, trip.endDate);

  return (
    <div className="rounded-lg border border-border p-4 transition-shadow duration-base hover:shadow-panel">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/trips/${trip.id}`} className="min-w-0 flex-1">
          <p className="truncate text-h3 font-display text-ink">{trip.name}</p>
        </Link>
        <Dropdown
          align="end"
          trigger={
            <span className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-marigold-50 hover:text-ink">
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Trip actions</span>
            </span>
          }
        >
          <DropdownItem href={`/trips/${trip.id}`}>Open</DropdownItem>
          <button type="button" onClick={onDuplicate} className="block w-full px-3 py-2 text-left text-sm text-ink transition-colors duration-fast hover:bg-marigold-50">
            Duplicate
          </button>
          <button type="button" onClick={onDelete} className="block w-full px-3 py-2 text-left text-sm text-danger transition-colors duration-fast hover:bg-marigold-50">
            Delete
          </button>
        </Dropdown>
      </div>

      {trip.locationName && <p className="mt-1 text-caption text-ink-muted">{trip.locationName}</p>}
      {dateRange && <p className="mt-1 text-caption text-ink">{dateRange}</p>}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-caption text-ink-muted">
        {trip.days && <span>{trip.days} day{trip.days === 1 ? "" : "s"}</span>}
        <span>
          {trip.itemCount} item{trip.itemCount === 1 ? "" : "s"}
        </span>
        {trip.estimatedBudget != null && <span>₹{trip.estimatedBudget.toLocaleString("en-IN")}</span>}
      </div>

      <p className="mt-2 text-label text-ink-muted">Updated {new Date(trip.updatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
    </div>
  );
}
