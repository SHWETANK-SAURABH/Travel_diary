import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPreference } from "@/features/users/service";
import { recommendDestinations, preferenceToContext } from "@/features/recommendations";
import type { RecommendationContext } from "@/features/recommendations";
import { recommendationRequestSchema } from "@/lib/validation";

/**
 * Powers the client-side "Recommended for You" rail (src/components/
 * recommendations). Signed-in requests are scored against the account's
 * real `UserPreference` row, loaded server-side — a signed-in request's
 * `guestPreferences` field, if sent, is ignored entirely, since trusting
 * client-supplied personalization data for an authenticated user would let
 * one request forge another signal set. Anonymous requests use whatever
 * preferences the guest has set locally (src/lib/guest/store.ts), which
 * carries no comparable trust requirement since it only ever describes the
 * requester themself.
 */
export async function POST(request: Request) {
  const body = recommendationRequestSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request", issues: body.error.issues }, { status: 400 });
  }

  const session = await auth();
  let context: RecommendationContext = { month: body.data.month, stateSlug: body.data.stateSlug };

  if (session) {
    const preference = await getPreference(session.user.id);
    context = preferenceToContext(preference, context);
  } else if (body.data.guestPreferences) {
    const guest = body.data.guestPreferences;
    context = {
      ...context,
      interestTagIds: guest.interestTagIds,
      travelStyle: guest.travelStyle,
      budgetAmount: guest.budgetAmount,
      durationDays: guest.durationDays,
      travellerCount: guest.travellerCount,
      crowdPreference: guest.crowdPreference,
      travelDateStart: guest.travelDateStart ? new Date(guest.travelDateStart) : undefined,
      travelDateEnd: guest.travelDateEnd ? new Date(guest.travelDateEnd) : undefined,
    };
  }

  const result = await recommendDestinations(context, 5);
  return NextResponse.json(result);
}
