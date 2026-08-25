import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui";

export const metadata: Metadata = {
  title: "Explore",
  description: "Discover India's festivals, destinations, hidden gems, food and experiences.",
};

export default function ExplorePage() {
  return (
    <PlaceholderPage
      title="Explore"
      description="The full discovery experience — festival rails, destination spotlights, hidden gems — lands in a later phase. The underlying data layer (src/features/festivals, src/features/destinations, src/features/search) is already wired up."
    />
  );
}
