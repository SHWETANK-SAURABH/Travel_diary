import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Blanket `noindex` for every route under /trips — account-scoped itinerary
 * planning has no business in search results. Individual pages here
 * (/trips, /trips/[id]) already set this themselves, but /trips/new is a
 * Client Component and can't export `metadata` at all, so it silently fell
 * through without this. A layout-level default covers it (and any future
 * client-component page added under this tree) without every page needing
 * to remember to opt out of indexing on its own.
 *
 * `title` here is a fallback for the same reason — a page-level `title`
 * (like /trips's own "Trips") always wins over this, so it only actually
 * takes effect on /trips/new, which was otherwise falling through to the
 * root layout's generic "TravelDiary" tab title.
 */
export const metadata: Metadata = {
  title: "Plan a trip",
  robots: { index: false },
};

export default function TripsLayout({ children }: { children: ReactNode }) {
  return children;
}
