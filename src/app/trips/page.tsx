import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { listTrips } from "@/features/trips/service";
import { Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { AccountTripCard } from "./AccountTripCard";
import { GuestTripsList } from "./GuestTripsList";

export const metadata: Metadata = {
  title: "Trips",
  robots: { index: false }, // account-scoped page
};

export default async function TripsPage() {
  const session = await auth();

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1 font-display">Your trips</h1>
        <Link href="/trips/new">
          <Button>Create a trip</Button>
        </Link>
      </div>

      {session ? <AccountTrips userId={session.user.id} /> : <GuestTripsList />}
    </Container>
  );
}

async function AccountTrips({ userId }: { userId: string }) {
  const trips = await listTrips(userId);

  if (trips.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-h3 font-display text-ink">Your next adventure starts here.</p>
        <p className="max-w-sm text-caption text-ink-muted">Create a trip to start building your itinerary.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href="/trips/new">
            <Button>Create a trip</Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline">Explore India</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <AccountTripCard
          key={trip.id}
          trip={{
            id: trip.id,
            name: trip.name,
            locationName: trip.location?.name ?? null,
            startDate: trip.startDate?.toISOString() ?? null,
            endDate: trip.endDate?.toISOString() ?? null,
            days: trip.days,
            itemCount: trip._count.items,
            estimatedBudget: trip.estimatedBudget,
            updatedAt: trip.updatedAt.toISOString(),
          }}
        />
      ))}
    </div>
  );
}
