# components/destinations

Destination listing/detail UI (Phase 5). Presentational — data comes from
`src/features/destinations` (the discovery feed, ranking, and seasonal
helpers). Shared cross-content pieces (Gallery, filter/month links, Save/
Visited/Add-to-Trip/Share, Nearby) live in `src/components/ui` and
`src/components/discovery` instead of being duplicated here — see
`src/components/festivals/README.md` for the same pattern applied there
first.

- `DestinationCard` — the lightweight discovery card.
- `BudgetBadge` — renders a `BudgetLevel` as ₹/₹₹/₹₹₹.

See `src/app/destinations/page.tsx` and `src/app/destinations/[slug]/page.tsx`
for how these compose.
