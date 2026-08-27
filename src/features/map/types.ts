import type { BoundingBox } from "@/lib/geo";
import type { ContentPopularity, LocationPrecision } from "@prisma/client";

export type MapDiscoveryKind = "festival" | "destination" | "experience" | "event";

/**
 * Normalized shape every discovery on the map is reduced to, regardless of
 * source table — the map/UI layer never branches on Prisma model shape.
 * Deliberately lightweight (per the spec: "do not return huge descriptions
 * or unnecessary content" from the map endpoint).
 */
export interface MapDiscovery {
  id: string;
  kind: MapDiscoveryKind;
  name: string;
  latitude: number;
  longitude: number;
  locationPrecision: LocationPrecision;
  /** Null for kinds without a public detail page yet (Event). */
  slug: string | null;
  popularity: ContentPopularity | null;
}

export interface MapViewportQuery {
  box: BoundingBox;
  /** 1-12, or undefined for "All Year". */
  month?: number;
}

export interface MapSearchResult {
  kind: "state" | "city" | "festival" | "destination";
  id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Suggested zoom level to fly to for this result's kind. */
  zoom: number;
}

export interface StateSummary {
  slug: string;
  name: string;
  festivalCount: number;
  destinationCount: number;
  hiddenCount: number;
}
