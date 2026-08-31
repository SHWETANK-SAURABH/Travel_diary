"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker, LngLatBounds, setWorkerUrl, type GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Same static-worker-file fix as the Living Map (src/components/map/MapCanvas.tsx)
// — Turbopack can't resolve maplibre-gl's Web Worker module otherwise.
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const BASEMAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const INDIA_CENTER: [number, number] = [79.0, 22.9];

// Cycles for trips longer than 7 days — a day's colour is just a visual
// grouping aid, not meaningful beyond "same day as this marker."
const DAY_COLORS = ["#d97a1a", "#2a3568", "#bd5230", "#3f7a4f", "#7a4b8f", "#2f7a8f", "#8f6b3a"];

export interface TripMapPoint {
  id: string;
  name: string;
  day: number;
  latitude: number;
  longitude: number;
}

export interface TripMapProps {
  points: TripMapPoint[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

/**
 * A trip's own map — reuses the exact MapLibre/OpenFreeMap setup the Living
 * Map uses (spec §20: "do not build a second map system"), but as a
 * distinct, simpler component: a fixed small set of day-numbered markers
 * plus a dashed sequence line, not the pan/zoom viewport-driven discovery
 * layer. The dashed style is deliberate — spec §22: "do not pretend lines
 * represent actual driving routes unless a routing service is used."
 */
export function TripMap({ points, selectedId, onSelect }: TripMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      center: INDIA_CENTER,
      zoom: 4.2,
      attributionControl: false,
    });
    map.once("load", () => setReady(true));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const located = points.filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));

    located.forEach((point) => {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", `${point.name}, day ${point.day}`);
      const selected = point.id === selectedId;
      el.style.cssText = [
        "width:28px",
        "height:28px",
        "border-radius:9999px",
        `border:${selected ? 3 : 2}px solid white`,
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "font-size:12px",
        "font-weight:600",
        "color:white",
        "cursor:pointer",
        `background:${DAY_COLORS[(point.day - 1) % DAY_COLORS.length]}`,
        `box-shadow:0 1px 4px rgba(0,0,0,${selected ? 0.5 : 0.3})`,
      ].join(";");
      el.textContent = String(point.day);
      el.onclick = () => onSelect?.(point.id);

      const marker = new Marker({ element: el }).setLngLat([point.longitude, point.latitude]).addTo(map);
      markersRef.current.set(point.id, marker);
    });

    const coordinates: [number, number][] = located.map((p) => [p.longitude, p.latitude]);
    const geojson = { type: "Feature" as const, properties: {}, geometry: { type: "LineString" as const, coordinates } };

    if (map.getSource("trip-route")) {
      (map.getSource("trip-route") as GeoJSONSource).setData(geojson);
    } else if (coordinates.length > 1) {
      map.addSource("trip-route", { type: "geojson", data: geojson });
      map.addLayer({
        id: "trip-route-line",
        type: "line",
        source: "trip-route",
        paint: { "line-color": "#6b6355", "line-width": 2, "line-dasharray": [2, 2] },
      });
    }

    if (located.length === 1) {
      map.flyTo({ center: [located[0].longitude, located[0].latitude], zoom: 8 });
    } else if (located.length > 1) {
      const bounds = coordinates.reduce((b, c) => b.extend(c), new LngLatBounds(coordinates[0], coordinates[0]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 10, duration: 0 });
    }
  }, [points, selectedId, onSelect, ready]);

  const hasLocatedPoints = points.some((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {!hasLocatedPoints && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-paper/70 p-4 text-center text-caption text-ink-muted">
          Add destinations or festivals to see them on the map.
        </div>
      )}
    </div>
  );
}
