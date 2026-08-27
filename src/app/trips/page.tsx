import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { listTrips } from "@/features/trips/service";
import { Container } from "@/components/layout";
import { Card, CardHeader, CardTitle, Button, EmptyState } from "@/components/ui";

export const metadata: Metadata = {
  title: "Trips",
  robots: { index: false }, // account-scoped page
};

export default async function TripsPage() {
  const session = await auth();

  if (!session) {
    return (
      <Container className="py-24">
        <h1 className="font-display text-h1">Trips</h1>
        <p className="mt-3 max-w-xl text-ink-muted">
          Trips can already be planned as a guest — saved locally on this device (see
          src/lib/guest) — and synced to an account once you sign in. The trip builder UI is a
          later phase; sign in to see any trips already saved to your account.
        </p>
        <Link href="/auth/sign-in?callbackUrl=/trips">
          <Button className="mt-6">Sign in</Button>
        </Link>
      </Container>
    );
  }

  const trips = await listTrips(session.user.id);

  return (
    <Container className="py-12">
      <h1 className="text-h1 font-display">Your trips</h1>
      {trips.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No trips yet"
          description="Start building your first trip — save festivals and destinations as you explore."
          action={
            <Link href="/explore">
              <Button variant="outline">Start exploring</Button>
            </Link>
          }
        />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card>
                <CardHeader>
                  <CardTitle>{trip.name}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
