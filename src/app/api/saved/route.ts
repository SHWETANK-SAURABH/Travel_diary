import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleSavedContent, isContentSaved } from "@/features/users/service";
import { toggleSavedSchema } from "@/lib/validation";

/** Current saved-state for one item — lets a re-opened panel show the right toggle state instead of assuming "not saved". */
export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ saved: false });
  }

  const { searchParams } = new URL(request.url);
  const parsed = toggleSavedSchema.safeParse({
    contentType: searchParams.get("contentType"),
    contentId: searchParams.get("contentId"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const saved = await isContentSaved(session.user.id, parsed.data.contentType, parsed.data.contentId);
  return NextResponse.json({ saved });
}

/** Save/unsave for signed-in users. Guests save locally — see src/lib/guest/store.ts — and never hit this route. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = toggleSavedSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request", issues: body.error.issues }, { status: 400 });
  }

  const result = await toggleSavedContent(session.user.id, body.data.contentType, body.data.contentId);
  return NextResponse.json(result);
}
