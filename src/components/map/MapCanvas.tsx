"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
  type GeoJSONSource,
  type LngLatBoundsLike,
  type MapLayerMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { BoundingBox } from "@/lib/geo";
import type { MapDiscovery } from "@/features/map/types";
import type { MapLayer } from "./LayerControls";

// Turbopack doesn't correctly resolve maplibre-gl's internal Web Worker
// module, which otherwise leaves the map permanently blank with no error
// (see public/maplibre/README.md). Pointing it at a plain static copy
// sidesteps bundler worker resolution entirely. Must run before any Map
// is constructed.
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

// Free, keyless vector basemap — no API key/billing to configure for local
// dev or production. See docs/architecture.md, "Map, deferred" for the
// selection rationale. Public-domain state boundaries: public/geo/SOURCE.md.
const BASEMAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const STATES_SOURCE_URL = "/geo/india-states.geojson";

const INDIA_CENTER: [number, number] = [79.0, 22.9];
const INDIA_INITIAL_ZOOM = 4.2;

const KIND_COLOR: Record<MapDiscovery["kind"], string> = {
  festival: "#d97a1a", // marigold-500
  destination: "#2a3568", // navy-500
  experience: "#bd5230", // terracotta-500
  event: "#6b6355", // ink-muted
};

// Single-letter glyphs so discovery types are distinguishable without
// relying on color alone (accessibility guidance in docs/phase.md).
const KIND_LABEL: Record<MapDiscovery["kind"], string> = {
  festival: "F",
  destination: "D",
  experience: "X",
  event: "V",
};

function matchesLayer(discovery: MapDiscovery, layer: MapLayer): boolean {
  switch (layer) {
    case "Festivals":
      return discovery.kind === "festival";
    case "Destinations":
      return discovery.kind === "destination";
    case "Hidden Gems":
      return discovery.popularity === "HIDDEN";
    case "Experiences":
      return discovery.kind === "experience";
    case "Food / Events":
      return discovery.kind === "event";
  }
}

function toFeatureCollection(discoveries: MapDiscovery[], activeLayers: MapLayer[]) {
  const visible = discoveries.filter((d) => activeLayers.some((layer) => matchesLayer(d, layer)));

  return {
    type: "FeatureCollection" as const,
    features: visible.map((d) => ({
      type: "Feature" as const,
      id: d.id,
      geometry: { type: "Point" as const, coordinates: [d.longitude, d.latitude] },
      properties: {
        id: d.id,
        kind: d.kind,
        name: d.name,
        slug: d.slug,
        color: KIND_COLOR[d.kind],
        label: KIND_LABEL[d.kind],
      },
    })),
  };
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Manual bbox over a GeoJSON geometry's coordinates — avoids pulling in @turf/bbox for one calculation. */
function geometryBounds(geometry: GeoJSON.Geometry): LngLatBoundsLike {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  function visit(coords: unknown[]): void {
    if (typeof coords[0] === "number") {
      const [lng, lat] = coords as [number, number];
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    } else {
      (coords as unknown[][]).forEach(visit);
    }
  }
  visit((geometry as { coordinates: unknown[] }).coordinates);

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export interface MapCanvasHandle {
  flyTo(lat: number, lng: number, zoom: number): void;
}

export interface MapCanvasProps {
  discoveries: MapDiscovery[];
  activeLayers: MapLayer[];
  selectedStateSlug: string | null;
  initialView?: { lat: number; lng: number; zoom: number };
  onViewportChange: (box: BoundingBox, zoom: number, center: { lat: number; lng: number }) => void;
  onDiscoverySelect: (discovery: Pick<MapDiscovery, "id" | "kind" | "slug">) => void;
  onStateSelect: (slug: string) => void;
  onZoom?: (zoom: number) => void;
  /** Fires once the basemap style, states layer, and discovery layers are all in place — lets the caller swap a loading skeleton for the real canvas instead of showing a blank div while the style/tiles/fonts load. */
  onMapLoad?: () => void;
}

export const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(function MapCanvas(
  { discoveries, activeLayers, selectedStateSlug, initialView, onViewportChange, onDiscoverySelect, onStateSelect, onZoom, onMapLoad },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const loadedRef = useRef(false);
  const hoveredStateId = useRef<string | number | null>(null);
  const selectedStateId = useRef<string | number | null>(null);
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The mount effect below registers its event handlers exactly once and
  // never re-subscribes, so it can't close over fresh prop values on every
  // render — these refs are the standard escape hatch, kept current on
  // every render and dereferenced (`.current`) inside the handlers instead
  // of the props directly.
  const onViewportChangeRef = useRef(onViewportChange);
  const onDiscoverySelectRef = useRef(onDiscoverySelect);
  const onStateSelectRef = useRef(onStateSelect);
  const onZoomRef = useRef(onZoom);
  const onMapLoadRef = useRef(onMapLoad);
  useEffect(() => {
    onViewportChangeRef.current = onViewportChange;
    onDiscoverySelectRef.current = onDiscoverySelect;
    onStateSelectRef.current = onStateSelect;
    onZoomRef.current = onZoom;
    onMapLoadRef.current = onMapLoad;
  });

  useImperativeHandle(ref, () => ({
    flyTo(lat, lng, zoom) {
      const map = mapRef.current;
      if (!map) return;
      const options = { center: [lng, lat] as [number, number], zoom };
      if (prefersReducedMotion()) map.jumpTo(options);
      else map.flyTo({ ...options, duration: 900 });
    },
  }));

  // Mount once.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      center: initialView ? [initialView.lng, initialView.lat] : INDIA_CENTER,
      zoom: initialView?.zoom ?? INDIA_INITIAL_ZOOM,
      minZoom: 3,
      maxZoom: 16,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");

    map.on("error", (e) => console.error("[maplibre]", e.error?.message));
    map.on("load", () => {
      // Restyle the base layers toward the product palette instead of
      // shipping the stock basemap look, per "the map should fit the
      // product's visual identity" — layer ids are OpenMapTiles' standard
      // schema (see public/geo/SOURCE.md's note on the tile source).
      try {
        map.setPaintProperty("background", "background-color", "#f2ece0");
        map.setPaintProperty("water", "fill-color", "#dfe4e8");
        map.setPaintProperty("park", "fill-color", "#e7ecdf");
      } catch {
        // Basemap style layer ids can change upstream; a cosmetic tweak
        // failing shouldn't break the map.
      }

      map.addSource("india-states", { type: "geojson", data: STATES_SOURCE_URL, promoteId: "slug" });

      map.addLayer({
        id: "state-fill",
        type: "fill",
        source: "india-states",
        paint: {
          "fill-color": "#d97a1a",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            0.18,
            ["boolean", ["feature-state", "hover"], false],
            0.1,
            0,
          ],
        },
      });

      map.addLayer({
        id: "state-line",
        type: "line",
        source: "india-states",
        paint: {
          "line-color": "#211d17",
          "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 1.6, 0.6],
          "line-opacity": 0.5,
        },
      });

      map.addSource("discoveries", {
        type: "geojson",
        data: toFeatureCollection(discoveries, activeLayers),
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 12,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "discoveries",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#d97a1a",
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 50, 26],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#faf6ee",
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "discoveries",
        filter: ["has", "point_count"],
        layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 12, "text-font": ["Noto Sans Bold"] },
        paint: { "text-color": "#ffffff" },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "discoveries",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 9,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#faf6ee",
        },
      });

      map.addLayer({
        id: "unclustered-label",
        type: "symbol",
        source: "discoveries",
        filter: ["!", ["has", "point_count"]],
        layout: { "text-field": ["get", "label"], "text-size": 10, "text-font": ["Noto Sans Bold"] },
        paint: { "text-color": "#ffffff" },
      });

      map.on("click", "clusters", (e: MapLayerMouseEvent) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const clusterId = feature.properties?.cluster_id;
        const source = map.getSource("discoveries") as GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
          map.easeTo({ center: [lng, lat], zoom });
        });
      });

      map.on("click", "unclustered-point", (e: MapLayerMouseEvent) => {
        const props = e.features?.[0]?.properties;
        if (!props) return;
        onDiscoverySelectRef.current({ id: props.id, kind: props.kind, slug: props.slug ?? null });
      });

      map.on("click", "state-fill", (e: MapLayerMouseEvent) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const slug = feature.properties?.slug as string | undefined;
        if (!slug) return;
        onStateSelectRef.current(slug);
        const bounds = geometryBounds(feature.geometry);
        if (prefersReducedMotion()) map.fitBounds(bounds, { padding: 40, duration: 0 });
        else map.fitBounds(bounds, { padding: 40, duration: 700 });
      });

      map.on("mousemove", "state-fill", (e: MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = "pointer";
        const id = e.features?.[0]?.id;
        if (id === undefined || id === hoveredStateId.current) return;
        if (hoveredStateId.current !== null) {
          map.setFeatureState({ source: "india-states", id: hoveredStateId.current }, { hover: false });
        }
        hoveredStateId.current = id;
        map.setFeatureState({ source: "india-states", id }, { hover: true });
      });
      map.on("mouseleave", "state-fill", () => {
        map.getCanvas().style.cursor = "";
        if (hoveredStateId.current !== null) {
          map.setFeatureState({ source: "india-states", id: hoveredStateId.current }, { hover: false });
        }
        hoveredStateId.current = null;
      });

      map.on("mouseenter", "unclustered-point", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "unclustered-point", () => (map.getCanvas().style.cursor = ""));
      map.on("mouseenter", "clusters", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "clusters", () => (map.getCanvas().style.cursor = ""));

      const emitViewport = () => {
        const b = map.getBounds();
        onViewportChangeRef.current(
          { minLat: b.getSouth(), minLng: b.getWest(), maxLat: b.getNorth(), maxLng: b.getEast() },
          map.getZoom(),
          map.getCenter()
        );
      };

      map.on("moveend", () => {
        // Debounced per "do not issue API requests on every pixel of map movement".
        if (moveTimer.current) clearTimeout(moveTimer.current);
        moveTimer.current = setTimeout(emitViewport, 300);
      });

      map.on("zoomend", () => onZoomRef.current?.(map.getZoom()));

      loadedRef.current = true;
      emitViewport();
      onMapLoadRef.current?.();
    });

    return () => {
      if (moveTimer.current) clearTimeout(moveTimer.current);
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
    // Mount/unmount only — all interaction-driving props are read via refs/closures set up once, updated below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the discoveries source in sync — setData only (no network, no re-mount).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const source = map.getSource("discoveries") as GeoJSONSource | undefined;
    source?.setData(toFeatureCollection(discoveries, activeLayers));
  }, [discoveries, activeLayers]);

  // Keep the selected-state highlight in sync.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    if (selectedStateId.current !== null) {
      map.setFeatureState({ source: "india-states", id: selectedStateId.current }, { selected: false });
    }
    selectedStateId.current = selectedStateSlug;
    if (selectedStateSlug) {
      map.setFeatureState({ source: "india-states", id: selectedStateSlug }, { selected: true });
    }
  }, [selectedStateSlug]);

  // Not "absolute inset-0": maplibre-gl's own stylesheet sets
  // `.maplibregl-map { position: relative }` on this element once it
  // initializes, which — at equal selector specificity — wins the cascade
  // over a Tailwind `absolute` class and silently breaks `inset-0`'s fill
  // behavior (the container collapses to zero height). A percentage size
  // against the already-sized flex-1 parent sidesteps the fight entirely.
  return <div ref={containerRef} className="h-full w-full" role="application" aria-label="Map of India" />;
});
