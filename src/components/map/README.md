# components/map

## What exists (Phase 2)

Layout and control primitives — no real map yet:

- `MapShell.tsx` — the full-viewport shell: controls row + canvas area +
  `ResponsivePanel` (side panel desktop / bottom sheet mobile) wired
  together, matching the wireframes in `docs/phase.md` ("MAP-READY DESIGN").
- `MonthSelector.tsx`, `LayerControls.tsx` — presentational controls
  (Jan–Dec + All Year; Festivals/Destinations/Hidden Gems/Experiences/
  Food-Events). Purely `value`/`onChange` — no data wiring yet.

See `src/app/map/page.tsx` / `MapPageClient.tsx` for how these compose today
(a loading-skeleton canvas standing in for the real map).

## What's reserved for Phase 3 (the Living India Map)

- The actual MapLibre GL canvas: India/state boundaries, vector tiles,
  clustering, markers.
- Wiring `MonthSelector`/`LayerControls` to `getViewportContent()` in
  `src/features/map/service.ts`.
- The discovery preview panel (rendered inside `MapShell`'s
  `panelContent`) and state-selection panel.

Keep the data layer (`src/features/map`, `src/lib/geo`) and this
presentation layer separate — components here should stay map-canvas-agnostic
so swapping map libraries later doesn't touch the panel/controls code.
