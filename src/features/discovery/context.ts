/**
 * The "shared discovery context" the spec asks for — month + geographic
 * scope carried between Search, Calendar, Map, Festivals, Destinations and
 * Explore. Deliberately NOT a client-side store: every one of those pages
 * already treats `?month=`/`?state=` in the URL as its source of truth (see
 * MapPageClient, /festivals, /destinations), so the "shared context" is the
 * URL itself. This module is the one place that builds cross-page links
 * out of it, so each page doesn't hand-roll its own query-string logic.
 */

export interface DiscoveryContext {
  /** 1-12, or null/undefined for "All Year". */
  month?: number | null;
  stateSlug?: string | null;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export function monthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? "";
}

export function calendarHref(ctx: DiscoveryContext = {}): string {
  const params = new URLSearchParams();
  if (ctx.month) params.set("month", String(ctx.month));
  const qs = params.toString();
  return qs ? `/calendar?${qs}` : "/calendar";
}

/**
 * A month-only map deep link — MapPageClient applies `month` independently
 * of lat/lng/zoom (see its parseUrlState), so this doesn't need to know the
 * map's current viewport.
 */
export function mapHref(ctx: DiscoveryContext = {}): string {
  const params = new URLSearchParams();
  if (ctx.month) params.set("month", String(ctx.month));
  const qs = params.toString();
  return qs ? `/map?${qs}` : "/map";
}

export function festivalsHref(ctx: DiscoveryContext = {}): string {
  const params = new URLSearchParams();
  if (ctx.month) params.set("month", String(ctx.month));
  if (ctx.stateSlug) params.set("state", ctx.stateSlug);
  const qs = params.toString();
  return qs ? `/festivals?${qs}` : "/festivals";
}

export function destinationsHref(ctx: DiscoveryContext = {}): string {
  const params = new URLSearchParams();
  if (ctx.month) params.set("month", String(ctx.month));
  if (ctx.stateSlug) params.set("state", ctx.stateSlug);
  const qs = params.toString();
  return qs ? `/destinations?${qs}` : "/destinations";
}
