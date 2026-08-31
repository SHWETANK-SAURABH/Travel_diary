import { NextResponse } from "next/server";
import { resolveContentRecords } from "@/lib/content/resolve";
import { resolveContentSchema } from "@/lib/validation";

/**
 * Resolves `(contentType, contentId)` pairs into display-ready records —
 * only path that lets a *guest's* itinerary (localStorage-only, no server
 * trip row) show images/names/locations for its items, since the browser
 * has no other way to query Prisma. No authentication needed: this only
 * ever returns already-public content data, never anything user-specific.
 */
export async function POST(request: Request) {
  const body = resolveContentSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request", issues: body.error.issues }, { status: 400 });
  }

  const items = await resolveContentRecords(body.data.items);
  return NextResponse.json({ items });
}
