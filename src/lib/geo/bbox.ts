import type { BoundingBox } from "./types";

/**
 * `where` clause fragment for "is this row's lat/lng inside the viewport",
 * for any model with `latitude`/`longitude` Float? fields. This is the
 * cheap, index-backed (see the `[latitude, longitude]` indexes in
 * schema.prisma) path used for most map viewport loads — no PostGIS needed.
 *
 * India never crosses the antimeridian, so we don't need to handle bbox
 * wraparound (minLng > maxLng) here.
 *
 * @example
 * db.festival.findMany({ where: { ...boundingBoxWhere(box), status: "PUBLISHED" } })
 */
export function boundingBoxWhere(box: BoundingBox) {
  return {
    latitude: { gte: box.minLat, lte: box.maxLat },
    longitude: { gte: box.minLng, lte: box.maxLng },
  } as const;
}

/** Expands a bounding box by a margin (in degrees) — useful for prefetching just outside the visible viewport. */
export function padBoundingBox(box: BoundingBox, marginDegrees: number): BoundingBox {
  return {
    minLat: box.minLat - marginDegrees,
    minLng: box.minLng - marginDegrees,
    maxLat: box.maxLat + marginDegrees,
    maxLng: box.maxLng + marginDegrees,
  };
}
