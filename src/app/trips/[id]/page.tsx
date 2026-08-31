import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getTrip, resolveTripItems, getTripInsights } from "@/features/trips/service";
import { Container } from "@/components/layout";
import { AccountTripEditor } from "./AccountTripEditor";
import { GuestTripEditor } from "./GuestTripEditor";
import type { TripMeta } from "./TripPlannerView";

export const metadata: Metadata = {
  title: "Trip",
  robots: { index: false },
};

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Account trips are fetched and computed server-side (spec §39: never trust
 * a client-supplied id for an owner-scoped fetch). A signed-in user whose
 * id doesn't resolve to one of their own trips — or nobody signed in at all
 * — falls through to the guest editor, which reads localStorage; that's a
 * safe default either way, since a signed-in user's guest store empties out
 * on the sign-in merge (Phase 8) and will just as correctly show "not
 * found" for an id it doesn't have.
 */
export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  if (session) {
    const trip = await getTrip(session.user.id, id);
    if (trip) {
      const [items, insights] = await Promise.all([resolveTripItems(trip.items), getTripInsights(trip)]);

      const initialMeta: TripMeta = {
        name: trip.name,
        startDate: trip.startDate?.toISOString() ?? null,
        endDate: trip.endDate?.toISOString() ?? null,
        days: trip.days,
        travellerCount: trip.travellerCount,
        estimatedBudget: trip.estimatedBudget,
        locationName: trip.location?.name ?? null,
        visibility: trip.visibility,
      };

      return (
        <Container className="py-12">
          <AccountTripEditor
            tripId={trip.id}
            initialMeta={initialMeta}
            initialItems={items.map((i) => ({ id: i.id, day: i.day, order: i.order, notes: i.notes, content: i.content }))}
            initialBudget={insights.budget}
            initialConflicts={insights.conflicts}
            initialSuggestions={insights.suggestions}
          />
        </Container>
      );
    }
  }

  return (
    <Container className="py-12">
      <GuestTripEditor tripId={id} />
    </Container>
  );
}
