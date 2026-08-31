import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { duplicateTrip } from "@/features/trips/service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const trip = await duplicateTrip(session.user.id, id);
    return NextResponse.json({ trip });
  } catch {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
}
