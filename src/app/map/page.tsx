import type { Metadata } from "next";
import { MapPageClient } from "./MapPageClient";

export const metadata: Metadata = {
  title: "Map",
  description: "The living map of India — festivals, destinations and experiences, by state and by month.",
};

export default function MapPage() {
  return <MapPageClient />;
}
