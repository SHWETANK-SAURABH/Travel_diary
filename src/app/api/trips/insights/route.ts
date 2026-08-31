import { NextResponse } from "next/server";
import { getTripInsights } from "@/features/trips/service";
import { tripInsightsSchema } from "@/lib/validation";

/**
 * Budget estimate + festival conflicts + nearby suggestions for an
 * itinerary that has no server Trip row — i.e. a guest's. No authentication:
 * the request carries the itinerary itself (content ids + dates), and the
 * response only ever contains already-public content data, the same trust
 * boundary as /api/trips/resolve.
 */
export async function POST(request: Request) {
  const body = tripInsightsSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request", issues: body.error.issues }, { status: 400 });
  }

  const insights = await getTripInsights({
    startDate: body.data.startDate ?? null,
    endDate: body.data.endDate ?? null,
    days: body.data.days ?? null,
    travellerCount: body.data.travellerCount ?? null,
    items: body.data.items.map((i) => ({ id: i.id, contentType: i.contentType ?? null, contentId: i.contentId ?? null })),
  });

  return NextResponse.json(insights);
}
