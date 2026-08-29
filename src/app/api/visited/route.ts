import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleVisitedContent, isContentVisited } from "@/features/users/service";
import { toggleSavedSchema } from "@/lib/validation";

/**
 * "Mark as Visited" — authenticated only. Unlike Save, the guest
 * architecture from Phase 1 was scoped to save + trips, not visited state,
 * so this intentionally has no localStorage fallback; a signed-out user is
 * prompted to sign in (see VisitedButton.tsx).
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ visited: false });
  }

  const { searchParams } = new URL(request.url);
  const parsed = toggleSavedSchema.safeParse({
    contentType: searchParams.get("contentType"),
    contentId: searchParams.get("contentId"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const visited = await isContentVisited(session.user.id, parsed.data.contentType, parsed.data.contentId);
  return NextResponse.json({ visited });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = toggleSavedSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request", issues: body.error.issues }, { status: 400 });
  }

  const result = await toggleVisitedContent(session.user.id, body.data.contentType, body.data.contentId);
  return NextResponse.json(result);
}
