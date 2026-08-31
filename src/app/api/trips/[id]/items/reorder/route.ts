import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { reorderTripItemsInDay } from "@/features/trips/service";
import { reorderTripItemsSchema } from "@/lib/validation";
import { analytics } from "@/lib/analytics";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  const body = reorderTripItemsSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid reorder", issues: body.error.issues }, { status: 400 });
  }

  try {
    await reorderTripItemsInDay(session.user.id, id, body.data.day, body.data.orderedItemIds);
    await analytics.track({ type: "TRIP_INTERACTION", userId: session.user.id, metadata: { action: "item_reordered", tripId: id, day: body.data.day } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
}
