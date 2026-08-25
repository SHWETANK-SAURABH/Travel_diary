import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui";

export const metadata: Metadata = {
  title: "Hidden India",
  description: "Local and emerging festivals and offbeat destinations, off the well-worn path.",
};

export default function HiddenIndiaPage() {
  return (
    <PlaceholderPage
      title="Hidden India"
      description="A curated view over festivals and destinations tagged 'hidden' or 'local/emerging' — see the FestivalPopularity taxonomy in prisma/schema.prisma. UI lands in a later phase."
    />
  );
}
