import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { removeTripItem } from "@/features/trips/service";

interface RouteParams {
  params: Promise<{ id: string; itemId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id, itemId } = await params;
  try {
    await removeTripItem(session.user.id, id, itemId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
}
