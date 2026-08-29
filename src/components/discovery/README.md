# components/discovery

Shared content-action primitives usable from any content type/page — save,
mark-visited, add-to-trip, share (`SaveButton`, `VisitedButton`,
`AddToTripButton`, `ShareButton`, plus their hooks). Introduced in Phase 3
for the map's discovery panel, now reused as-is by the Phase 4 festival
detail page — the whole point of extracting them here.

Still reserved, not yet built: cross-content discovery surfaces that blend
festivals/destinations/experiences/food together — the homepage,
recommendation results ("Top 5, and why"), universal search results. Data
for those will come from `src/features/search` and
`src/features/recommendations`.
