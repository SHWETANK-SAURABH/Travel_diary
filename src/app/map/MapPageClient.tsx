"use client";

import { useState } from "react";
import { MapShell, MonthSelector, LayerControls, MAP_LAYERS, type MapLayer } from "@/components/map";
import { Skeleton } from "@/components/ui";

const CURRENT_MONTH = new Date().getMonth() + 1;

export function MapPageClient() {
  const [month, setMonth] = useState<number | null>(CURRENT_MONTH);
  const [layers, setLayers] = useState<MapLayer[]>([...MAP_LAYERS]);
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <MapShell
      controls={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <MonthSelector value={month} onChange={setMonth} />
          <LayerControls
            active={layers}
            onToggle={(layer) =>
              setLayers((current) =>
                current.includes(layer) ? current.filter((l) => l !== layer) : [...current, layer]
              )
            }
          />
        </div>
      }
      panelOpen={panelOpen}
      onPanelClose={() => setPanelOpen(false)}
      panelContent={
        <div className="p-4">
          <p className="text-h3 font-display">Discovery preview</p>
          <p className="mt-1 text-caption text-ink-muted">
            Selecting a marker will show a festival/destination preview here — Phase 3.
          </p>
        </div>
      }
    >
      {/* Stands in for the real MapLibre canvas until Phase 3. */}
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-border/20"
      >
        <Skeleton className="h-full w-full rounded-none" />
        <span className="absolute text-caption text-ink-muted">
          The Living India Map arrives in Phase 3 — this shell is ready for it.
        </span>
      </button>
    </MapShell>
  );
}
