import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mergeGuestData } from "@/features/users/service";
import { guestStateSchema } from "@/lib/validation";

/**
 * Called by the client right after sign-in with the localStorage guest
 * snapshot, so saved content and draft trips carry over into the account —
 * the "automatic merge of local guest data" from the guest-persistence
 * architecture.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = guestStateSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid guest state", issues: body.error.issues }, { status: 400 });
  }

  await mergeGuestData(session.user.id, body.data);
  return NextResponse.json({ ok: true });
}
