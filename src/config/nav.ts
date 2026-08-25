export interface NavItem {
  label: string;
  href: string;
}

/**
 * Primary navigation, defined once and consumed by header/mobile nav
 * components — never hardcode route labels/paths inside a component.
 */
export const primaryNav: NavItem[] = [
  { label: "Explore", href: "/explore" },
  { label: "Map", href: "/map" },
  { label: "Festivals", href: "/festivals" },
  { label: "Destinations", href: "/destinations" },
  { label: "Hidden India", href: "/hidden-india" },
  { label: "Calendar", href: "/calendar" },
  { label: "Trips", href: "/trips" },
];
