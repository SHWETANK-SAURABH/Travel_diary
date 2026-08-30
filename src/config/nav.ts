export interface NavItem {
  label: string;
  href: string;
}

export interface ExploreNavItem {
  label: string;
  /** null = not a real route yet, shown as "coming soon" rather than linking to a 404. */
  href: string | null;
}

/**
 * Minimal top-level desktop nav, per the Phase 2 nav spec: Logo, Explore▾,
 * Map, Trips, Search, Account. Everything content-browsing-related lives
 * inside the Explore menu instead of as separate top-level links.
 */
export const primaryNav: NavItem[] = [
  { label: "Map", href: "/map" },
  { label: "Trips", href: "/trips" },
];

/** Content of the Explore ▾ dropdown (desktop) and the Explore bottom sheet (mobile). */
export const exploreNav: ExploreNavItem[] = [
  { label: "Explore", href: "/explore" },
  { label: "Festivals", href: "/festivals" },
  { label: "Destinations", href: "/destinations" },
  { label: "Hidden India", href: "/hidden-india" },
  { label: "Calendar", href: "/calendar" },
  { label: "Food", href: null },
  { label: "Experiences", href: null },
  { label: "Seasonal Travel", href: null },
];
