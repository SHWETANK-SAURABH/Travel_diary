import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui";

export const metadata: Metadata = {
  title: "Calendar",
  description: "What's happening across India, month by month.",
};

export default function CalendarPage() {
  return (
    <PlaceholderPage
      title="Calendar"
      description="A month-by-month view over festival occurrences (FestivalOccurrence in prisma/schema.prisma already models confirmed/expected/not-announced dates). UI lands in a later phase."
    />
  );
}
