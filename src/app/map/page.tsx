import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui";

export const metadata: Metadata = {
  title: "Map",
  description: "The living map of India — festivals, destinations and experiences, by state and by month.",
};

export default function MapPage() {
  return (
    <PlaceholderPage
      title="The Living Map of India"
      description="The interactive map (vector basemap, clustering, month filtering, viewport-based loading) is Phase 2+. The viewport query it will call — getViewportContent() in src/features/map — is already built and tested against the geospatial schema."
    />
  );
}
