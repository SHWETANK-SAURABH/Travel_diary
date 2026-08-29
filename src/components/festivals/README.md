# components/festivals

Festival listing/detail UI (Phase 4). Presentational — data comes from
`src/features/festivals` (the discovery feed, ranking, and status/countdown
helpers). Shared cross-content actions (Save/Visited/Add to Trip/Share)
live in `src/components/discovery` instead of being duplicated here.

- `FestivalCard` — the lightweight discovery card.
- `FestivalStatusBadge`, `Countdown` — date/status display, shared by the
  card and the detail page's hero.
- `FestivalGallery` — compact grid + lightbox `Modal`.
- `NearbyDiscovery` — geographic "also explore nearby" grid.
- `FestivalMonthFilter` — server-rendered "Browse by Month" links (no
  client JS — real, bookmarkable per-month URLs).

See `src/app/festivals/page.tsx` and `src/app/festivals/[slug]/page.tsx`
for how these compose.
