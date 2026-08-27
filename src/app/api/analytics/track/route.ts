import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analytics } from "@/lib/analytics";
import { analyticsEventSchema } from "@/lib/validation";

/** The one route client components call to log an event — server components/services call `analytics.track()` directly instead. */
export async function POST(request: Request) {
  const body = analyticsEventSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const session = await auth();
  await analytics.track({ ...body.data, userId: session?.user.id });
  return NextResponse.json({ ok: true });
}
