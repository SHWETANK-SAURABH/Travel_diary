import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTrip } from "@/features/trips/service";
import { Container } from "@/components/layout";

export const metadata: Metadata = { robots: { index: false } };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect(`/auth/sign-in?callbackUrl=/trips/${id}`);

  const trip = await getTrip(session.user.id, id);
  if (!trip) notFound();

  return (
    <Container className="py-12">
      <h1 className="font-display text-h1">{trip.name}</h1>
      <p className="mt-2 text-ink-muted">
        {trip.items.length} item{trip.items.length === 1 ? "" : "s"} · Day-by-day itinerary editor
        lands in a later phase.
      </p>
    </Container>
  );
}
