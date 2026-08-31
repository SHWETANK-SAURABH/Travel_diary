import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createTrip, listTrips } from "@/features/trips/service";
import { createTripSchema } from "@/lib/validation";
import { analytics } from "@/lib/analytics";

/** Lightweight trip list (id + name only) — powers AddToTripButton's "add to existing trip" picker without threading the full trip list through every page that renders that button. */
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ trips: [] });
  }

  const trips = await listTrips(session.user.id);
  return NextResponse.json({ trips: trips.map((t) => ({ id: t.id, name: t.name })) });
}

/** Create a trip — signed-in only. Guests create trips locally (src/lib/guest/store.ts) and never hit this route. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = createTripSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid trip", issues: body.error.issues }, { status: 400 });
  }

  const trip = await createTrip(session.user.id, body.data);
  await analytics.track({ type: "TRIP_CREATED", userId: session.user.id, contentId: trip.id });
  return NextResponse.json({ trip });
}
