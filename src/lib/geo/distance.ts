import { db } from "@/lib/db";
import type { GeoPoint, LatLng } from "./types";

/**
 * Precise "nearby content" lookup using PostGIS (ST_DWithin on the
 * `geography(Point, 4326)` column), backed by the GIST indexes created in
 * the `search_and_geo_indexes` migration.
 *
 * Prefer {@link boundingBoxWhere} for map viewport loads (cheaper, no raw
 * SQL). Reach for this when you need an actual radius — e.g. "festivals
 * within 50km of this destination" for the future recommendation/"nearby"
 * features.
 *
 * `table` must be a literal from the allowlist below — never interpolate an
 * arbitrary caller-supplied string into raw SQL.
 */
const GEO_TABLES = ["Festival", "Destination", "Location"] as const;
type GeoTable = (typeof GEO_TABLES)[number];

export async function findNearby(
  table: GeoTable,
  origin: LatLng,
  radiusMeters: number,
  limit = 20
): Promise<GeoPoint[]> {
  if (!GEO_TABLES.includes(table)) {
    throw new Error(`Unsupported geo table: ${table}`);
  }

  // $queryRawUnsafe is required to parameterize the table name (Prisma has
  // no safe way to bind identifiers), but `table` is constrained to the
  // literal union above, so this never carries caller-controlled SQL.
  return db.$queryRawUnsafe<GeoPoint[]>(
    `
      SELECT id, latitude, longitude
      FROM "${table}"
      WHERE geo IS NOT NULL
        AND ST_DWithin(geo, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
      ORDER BY geo <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      LIMIT $4
    `,
    origin.longitude,
    origin.latitude,
    radiusMeters,
    limit
  );
}

/** Populates/refreshes the `geo` PostGIS column from `latitude`/`longitude` for one row. Call after any write that changes coordinates. */
export async function syncGeoPoint(table: GeoTable, id: string, point: LatLng): Promise<void> {
  if (!GEO_TABLES.includes(table)) {
    throw new Error(`Unsupported geo table: ${table}`);
  }

  await db.$executeRawUnsafe(
    `UPDATE "${table}" SET geo = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
    point.longitude,
    point.latitude,
    id
  );
}
