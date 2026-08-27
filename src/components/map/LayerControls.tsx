"use client";

import { Pill } from "@/components/ui";

export const MAP_LAYERS = ["Festivals", "Destinations", "Hidden Gems", "Experiences", "Food / Events"] as const;
export type MapLayer = (typeof MAP_LAYERS)[number];

export interface LayerControlsProps {
  active: MapLayer[];
  onToggle: (layer: MapLayer) => void;
}

/** Presentational layer toggle row — Phase 3 wires `active`/`onToggle` to the real viewport query's `layers` param. */
export function LayerControls({ active, onToggle }: LayerControlsProps) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Toggle map layers">
      {MAP_LAYERS.map((layer) => (
        <Pill key={layer} selected={active.includes(layer)} onClick={() => onToggle(layer)}>
          {layer}
        </Pill>
      ))}
    </div>
  );
}
