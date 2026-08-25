-- Search foundation: trigram indexes power fast ILIKE '%term%' matching for
-- V1's "normal search" (see src/lib/search). These are additive and can be
-- swapped for a dedicated search engine (e.g. Postgres full-text tsvector,
-- Meilisearch, Typesense) later without touching the base tables.
CREATE INDEX IF NOT EXISTS "Festival_name_trgm_idx" ON "Festival" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Destination_name_trgm_idx" ON "Destination" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Experience_name_trgm_idx" ON "Experience" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Food_name_trgm_idx" ON "Food" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Location_name_trgm_idx" ON "Location" USING GIN ("name" gin_trgm_ops);

-- Geospatial foundation: GIST indexes on the PostGIS geography columns so
-- viewport / radius queries (ST_DWithin, ST_Contains, the future map's
-- bounding-box lookups) stay index-backed instead of scanning every row.
-- See src/lib/geo for the query helpers that use these.
CREATE INDEX IF NOT EXISTS "Festival_geo_gist_idx" ON "Festival" USING GIST ("geo");
CREATE INDEX IF NOT EXISTS "Destination_geo_gist_idx" ON "Destination" USING GIST ("geo");
CREATE INDEX IF NOT EXISTS "Location_geo_gist_idx" ON "Location" USING GIST ("geo");
