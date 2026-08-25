# components/map

Reserved for the Living Map of India UI (Phase 2+): the MapLibre GL canvas,
layer toggles, clustering, marker/popup renderers, and the desktop
side-panel / mobile bottom-sheet wiring built on
[`ResponsivePanel`](../ui/ResponsivePanel.tsx).

Data comes from `src/features/map` (viewport queries) and `src/lib/geo`
(bounding-box / PostGIS helpers) — this folder should stay presentation-only.
