# Geographic data source

`india-states.geojson` — India's state/UT admin-1 boundaries, extracted and
simplified from **Natural Earth** (`ne_50m_admin_1_states_provinces`),
public domain (no restrictions on use, including commercial —
https://www.naturalearthdata.com/about/terms-of-use/).

Deliberately not GADM-derived (the more commonly linked "India states
GeoJSON" repos on GitHub) — GADM's license prohibits commercial
redistribution without permission, which doesn't fit a production app.

Processed with `mapshaper` (12% simplification, 0.001° coordinate
precision) to ~17KB, properties reduced to `{ name, slug, type }`, where
`slug` matches this project's `Location.slug` convention so state boundary
features can be joined against seeded/CMS `Location` rows by slug — see
`src/features/map/service.ts`.

Regenerate from source:

```bash
curl -sL -o ne.json https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson
node -e "const d=require('./ne.json'); const india=d.features.filter(f=>f.properties.adm0_a3==='IND'); /* map to {name, slug, type} — see git history for the exact script */"
npx mapshaper -i india-raw.json -simplify 12% keep-shapes -o format=geojson precision=0.001 india-states.geojson
```
