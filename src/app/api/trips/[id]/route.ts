import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTrip, updateTrip, deleteTrip, resolveTripItems, getTripInsights } from "@/features/trips/service";
import { updateTripSchema } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Full itinerary view (meta + resolved items + budget/conflicts/suggestions) for the trip editor — used both for client-side refresh after a mutation and, in principle, direct fetch. Ownership-scoped: a trip that isn't this user's 404s rather than 403s, so its existence isn't leaked. */
export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  const trip = await getTrip(session.user.id, id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const [items, insights] = await Promise.all([resolveTripItems(trip.items), getTripInsights(trip)]);

  return NextResponse.json({
    trip: {
      id: trip.id,
      name: trip.name,
      startDate: trip.startDate?.toISOString() ?? null,
      endDate: trip.endDate?.toISOString() ?? null,
      days: trip.days,
      travellerCount: trip.travellerCount,
      estimatedBudget: trip.estimatedBudget,
      visibility: trip.visibility,
      locationName: trip.location?.name ?? null,
    },
    items: items.map((i) => ({ id: i.id, day: i.day, order: i.order, notes: i.notes, content: i.content })),
    ...insights,
  });
}

/** Update trip metadata (name, dates, budget, travellers, visibility) — ownership enforced in the service layer via userId + tripId. */
export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  const body = updateTripSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid trip", issues: body.error.issues }, { status: 400 });
  }

  try {
    const trip = await updateTrip(session.user.id, id, body.data);
    return NextResponse.json({ trip });
  } catch {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await deleteTrip(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
}
