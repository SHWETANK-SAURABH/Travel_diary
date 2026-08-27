"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MapShell,
  MapCanvas,
  MonthSelector,
  LayerControls,
  MapSearch,
  DiscoveryPreviewPanel,
  StatePanel,
  MAP_LAYERS,
  type MapCanvasHandle,
  type MapLayer,
  type SelectedDiscovery,
} from "@/components/map";
import type { BoundingBox } from "@/lib/geo";
import type { MapDiscovery, MapSearchResult } from "@/features/map/types";
import { trackClientEvent } from "@/lib/analytics/client";

const CURRENT_MONTH = new Date().getMonth() + 1;

interface MapUrlState {
  lat: number;
  lng: number;
  zoom: number;
  month: number | null;
}

/** Reads map context from the URL once on mount — see the write side in the moveend/month-change effects below. Bypasses next/navigation on purpose: these updates are UI-state bookkeeping, not page navigation, so plain history.replaceState avoids re-running RSC data fetches on every pan. */
function readUrlState(): MapUrlState | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const lat = params.get("lat");
  const lng = params.get("lng");
  const zoom = params.get("zoom");
  const month = params.get("month");
  if (!lat || !lng || !zoom) return null;
  return {
    lat: Number(lat),
    lng: Number(lng),
    zoom: Number(zoom),
    month: month === "all" ? null : month ? Number(month) : CURRENT_MONTH,
  };
}

function writeUrlState(center: { lat: number; lng: number }, zoom: number, month: number | null) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  params.set("lat", center.lat.toFixed(4));
  params.set("lng", center.lng.toFixed(4));
  params.set("zoom", zoom.toFixed(2));
  params.set("month", month === null ? "all" : String(month));
  window.history.replaceState(null, "", `?${params.toString()}`);
}

export function MapPageClient() {
  // Safe to read synchronously: initialUrlState only ever feeds MapCanvas's
  // imperative camera setup (inside an effect, no SSR-rendered DOM to
  // mismatch). `month`, below, is different — it drives MonthSelector's
  // rendered `aria-pressed`/className output, so seeding it from
  // browser-only state here would make the very first client render
  // disagree with the server render (server always sees `initialUrlState =
  // null`) and trip a hydration mismatch. It starts at the server-safe
  // default and gets corrected once, client-side, in the effect below.
  const [initialUrlState] = useState(() => readUrlState());

  const [month, setMonth] = useState<number | null>(CURRENT_MONTH);
  const [activeLayers, setActiveLayers] = useState<MapLayer[]>([...MAP_LAYERS]);
  const [box, setBox] = useState<BoundingBox | null>(null);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    initialUrlState ? { lat: initialUrlState.lat, lng: initialUrlState.lng } : null
  );
  const [zoom, setZoom] = useState(initialUrlState?.zoom ?? 4.2);

  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedDiscovery, setSelectedDiscovery] = useState<SelectedDiscovery | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const mapRef = useRef<MapCanvasHandle>(null);
  const hasTrackedOpen = useRef(false);

  useEffect(() => {
    if (hasTrackedOpen.current) return;
    hasTrackedOpen.current = true;
    trackClientEvent({ type: "MAP_INTERACTION", path: "/map", metadata: { action: "map_opened" } });
  }, []);

  // Post-hydration correction for `month` — see the comment above its
  // useState call. This is the standard "read browser-only state after
  // mount" pattern for avoiding a hydration mismatch, not the effect
  // synchronizing-state-with-props anti-pattern the lint rule targets:
  // initialUrlState is a one-time snapshot of the URL at mount, not a prop
  // this needs to keep tracking.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
    if (initialUrlState) setMonth(initialUrlState.month);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally mount-only, see comment above
  }, []);

  const handleViewportChange = useCallback(
    (nextBox: BoundingBox, nextZoom: number, nextCenter: { lat: number; lng: number }) => {
      setBox(nextBox);
      setZoom(nextZoom);
      setCenter(nextCenter);
      writeUrlState(nextCenter, nextZoom, month);
    },
    [month]
  );

  const { data: discoveries = [] } = useQuery({
    queryKey: ["map-viewport", box, month],
    queryFn: async (): Promise<MapDiscovery[]> => {
      if (!box) return [];
      const params = new URLSearchParams({
        minLat: String(box.minLat),
        minLng: String(box.minLng),
        maxLat: String(box.maxLat),
        maxLng: String(box.maxLng),
      });
      if (month) params.set("month", String(month));
      const res = await fetch(`/api/map/viewport?${params.toString()}`);
      const data = await res.json();
      return data.discoveries ?? [];
    },
    enabled: box !== null,
    placeholderData: (previous) => previous,
  });

  function handleMonthChange(nextMonth: number | null) {
    setMonth(nextMonth);
    if (center) writeUrlState(center, zoom, nextMonth);
    trackClientEvent({ type: "MAP_INTERACTION", metadata: { action: "month_selected", month: nextMonth ?? "all" } });
  }

  function handleLayerToggle(layer: MapLayer) {
    setActiveLayers((current) => {
      const next = current.includes(layer) ? current.filter((l) => l !== layer) : [...current, layer];
      trackClientEvent({ type: "MAP_INTERACTION", metadata: { action: "layer_toggled", layer, enabled: !current.includes(layer) } });
      return next;
    });
  }

  function handleDiscoverySelect(discovery: Pick<MapDiscovery, "id" | "kind" | "slug">) {
    setSelectedDiscovery(discovery);
    setSelectedState(null);
    setPanelOpen(true);
    trackClientEvent({ type: "MAP_MARKER_CLICK", contentType: discovery.kind.toUpperCase() as "FESTIVAL" | "DESTINATION" | "EXPERIENCE" | "EVENT", contentId: discovery.id });
  }

  function handleStateSelect(slug: string) {
    setSelectedState(slug);
    setSelectedDiscovery(null);
    setPanelOpen(true);
    trackClientEvent({ type: "STATE_EXPLORATION", metadata: { state: slug } });
  }

  function handleSearchSelect(result: MapSearchResult) {
    mapRef.current?.flyTo(result.latitude, result.longitude, result.zoom);
    trackClientEvent({ type: "SEARCH_QUERY", metadata: { source: "map", kind: result.kind, name: result.name } });
    if (result.kind === "state") handleStateSelect(result.slug);
    else if (result.kind === "festival" || result.kind === "destination") {
      handleDiscoverySelect({ id: result.id, kind: result.kind, slug: result.slug });
    }
  }

  const panelContent = useMemo(() => {
    if (selectedDiscovery) return <DiscoveryPreviewPanel selected={selectedDiscovery} />;
    if (selectedState) return <StatePanel stateSlug={selectedState} month={month} />;
    return null;
  }, [selectedDiscovery, selectedState, month]);

  return (
    <MapShell
      controls={
        <div className="flex flex-col gap-2">
          <MapSearch onSelect={handleSearchSelect} />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <MonthSelector value={month} onChange={handleMonthChange} />
            <LayerControls active={activeLayers} onToggle={handleLayerToggle} />
          </div>
        </div>
      }
      panelOpen={panelOpen}
      onPanelClose={() => setPanelOpen(false)}
      panelContent={panelContent}
    >
      <MapCanvas
        ref={mapRef}
        discoveries={discoveries}
        activeLayers={activeLayers}
        selectedStateSlug={selectedState}
        initialView={initialUrlState ?? undefined}
        onViewportChange={handleViewportChange}
        onDiscoverySelect={handleDiscoverySelect}
        onStateSelect={handleStateSelect}
      />
    </MapShell>
  );
}
