import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { MapPageClient } from "./MapPageClient";

export const metadata: Metadata = {
  title: "Map",
  description: "The living map of India — festivals, destinations and experiences, by state and by month.",
};

// MapPageClient uses useSearchParams(), which requires a Suspense boundary —
// see the comment on parseUrlState in MapPageClient.tsx for why it's used
// instead of reading window.location directly.
export default function MapPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[calc(100vh-4rem)] w-full rounded-none" />}>
      <MapPageClient />
    </Suspense>
  );
}
