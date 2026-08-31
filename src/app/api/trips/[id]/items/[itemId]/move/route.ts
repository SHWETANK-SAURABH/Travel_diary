import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { moveTripItemToDay } from "@/features/trips/service";
import { moveTripItemSchema } from "@/lib/validation";
import { analytics } from "@/lib/analytics";

interface RouteParams {
  params: Promise<{ id: string; itemId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id, itemId } = await params;
  const body = moveTripItemSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid move", issues: body.error.issues }, { status: 400 });
  }

  try {
    await moveTripItemToDay(session.user.id, id, itemId, body.data.day);
    await analytics.track({ type: "TRIP_INTERACTION", userId: session.user.id, metadata: { action: "day_changed", tripId: id, itemId, day: body.data.day } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
}
