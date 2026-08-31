import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addTripItem } from "@/features/trips/service";
import { addTripItemSchema } from "@/lib/validation";
import { analytics } from "@/lib/analytics";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  const body = addTripItemSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid item", issues: body.error.issues }, { status: 400 });
  }

  try {
    const item = await addTripItem(session.user.id, { tripId: id, ...body.data });
    await analytics.track({
      type: "ADD_TO_TRIP",
      userId: session.user.id,
      contentType: body.data.contentType,
      contentId: body.data.contentId,
      metadata: { tripId: id },
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
}
