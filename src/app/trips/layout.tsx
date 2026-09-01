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
 */
export const metadata: Metadata = {
  robots: { index: false },
};

export default function TripsLayout({ children }: { children: ReactNode }) {
  return children;
}
