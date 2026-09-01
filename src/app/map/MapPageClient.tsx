"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { TrackedLink } from "@/components/discovery";
import { calendarHref, monthName } from "@/features/discovery/context";

const CURRENT_MONTH = new Date().getMonth() + 1;

interface MapViewState {
  lat: number;
  lng: number;
  zoom: number;
}

/**
 * Parses map context out of Next's `useSearchParams()` — deliberately NOT
 * `window.location.search`. During a client-side navigation (e.g. a
 * festival page's "View on Map" link), the new route's components can
 * start rendering (and read a `useState` lazy initializer) *before* the
 * browser's `location` object has actually been updated to the new URL —
 * a real race that was verified with logging: `location.search` was still
 * empty at the exact moment a naive read ran, even though a read a tick
 * later was correct. `useSearchParams()` is kept in sync with Next's
 * router instead of the raw browser API, so it doesn't have this race.
 */
function parseViewState(params: URLSearchParams): MapViewState | null {
  const lat = params.get("lat");
  const lng = params.get("lng");
  const zoom = params.get("zoom");
  if (!lat || !lng || !zoom) return null;
  return { lat: Number(lat), lng: Number(lng), zoom: Number(zoom) };
}

/**
 * Read independently of the viewport (lat/lng/zoom) — a Calendar "Explore
 * October on Map" link only sets `?month=`, with no viewport of its own, and
 * should still land on October rather than silently falling back to the
 * current month. Returns `undefined` when the URL has no `month` param at
 * all (so the caller doesn't clobber the default), `null` for "all year".
 */
function parseMonthParam(params: URLSearchParams): number | null | undefined {
  const month = params.get("month");
  if (month === null) return undefined;
  return month === "all" ? null : Number(month);
}

/**
 * Writes map context back to the URL via plain `history.replaceState`, not
 * `next/navigation`'s router — these are frequent UI-state bookkeeping
 * updates (every pan/zoom), and routing through Next's router would
 * re-run an RSC fetch on each one. This intentionally isn't visible to
 * `useSearchParams()` (see the read side above) — that's fine, since the
 * read side only needs the URL as of the *last real navigation*, not a
 * live view of every bookkeeping rewrite.
 */
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
  const searchParams = useSearchParams();
  // Recomputes only when Next's router actually navigates here with new
  // params (not on every writeUrlState rewrite above) — see the comment
  // on parseViewState.
  const initialUrlState = useMemo(() => parseViewState(searchParams), [searchParams]);
  const monthParam = useMemo(() => parseMonthParam(searchParams), [searchParams]);

  // `month` still starts at the server-safe default and gets corrected
  // once, client-side, in the effect below — the server render has no
  // request-independent way to know a Suspense-boundary-crossing
  // searchParams value is stable yet, so seeding it synchronously here
  // risks a hydration mismatch. Unlike the old bug, the correction now
  // reads a value that's actually reliably correct by the time it runs.
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-hydration correction, see the comment on `month` above
    if (monthParam !== undefined) setMonth(monthParam);
  }, [monthParam]);

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
    // A pan/zoom can fire a new viewport fetch before the previous one
    // resolves — passing `signal` through lets react-query abort the
    // stale request instead of letting a late response overwrite fresher
    // map data.
    queryFn: async ({ signal }): Promise<MapDiscovery[]> => {
      if (!box) return [];
      const params = new URLSearchParams({
        minLat: String(box.minLat),
        minLng: String(box.minLng),
        maxLat: String(box.maxLat),
        maxLng: String(box.maxLng),
      });
      if (month) params.set("month", String(month));
      const res = await fetch(`/api/map/viewport?${params.toString()}`, { signal });
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
            <div className="flex flex-wrap items-center gap-2">
              <MonthSelector value={month} onChange={handleMonthChange} />
              {month && (
                <TrackedLink
                  href={calendarHref({ month })}
                  event={{ type: "CALENDAR_INTERACTION", metadata: { action: "map_cta_clicked", month } }}
                  className="text-caption whitespace-nowrap text-marigold-600 hover:underline"
                >
                  View {monthName(month)} Festivals →
                </TrackedLink>
              )}
            </div>
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
