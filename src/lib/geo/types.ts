/** A map viewport, as reported by the client map library (e.g. MapLibre GL). */
export interface BoundingBox {
  /** Southwest corner. */
  minLat: number;
  minLng: number;
  /** Northeast corner. */
  maxLat: number;
  maxLng: number;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

/** A single point result from a viewport/radius geo query, before it is hydrated with full content. */
export interface GeoPoint extends LatLng {
  id: string;
}
