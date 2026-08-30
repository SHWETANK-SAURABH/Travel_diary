import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPreference, upsertPreference } from "@/features/users/service";
import { updatePreferenceSchema } from "@/lib/validation";
import { analytics } from "@/lib/analytics";

/** Current preferences for the signed-in user — powers the profile page and pre-filling the edit flow. Guests read their own preferences from src/lib/guest/store.ts instead. */
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const preference = await getPreference(session.user.id);
  return NextResponse.json({ preference });
}

/** Full onboarding/edit save for signed-in users. Guests persist locally — see src/lib/guest/store.ts — and never hit this route until they sign in (merge happens via /api/guest/merge). */
export async function PUT(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = updatePreferenceSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid preferences", issues: body.error.issues }, { status: 400 });
  }

  const preference = await upsertPreference(session.user.id, body.data);
  await analytics.track({ type: "PREFERENCE_UPDATED", userId: session.user.id });
  return NextResponse.json({ preference });
}
