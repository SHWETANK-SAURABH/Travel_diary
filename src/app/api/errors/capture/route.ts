import { NextResponse } from "next/server";
import { captureError } from "@/lib/errors";
import { clientErrorSchema } from "@/lib/validation";

/** The one route client-side error boundaries report to — server-side exceptions call captureError() directly instead. Deliberately accepts no free-form metadata beyond what the schema allows, since request bodies here are the one analytics-adjacent surface reachable by an unauthenticated client. */
export async function POST(request: Request) {
  const body = clientErrorSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }

  await captureError({ message: body.data.message, stack: body.data.stack, path: body.data.path, severity: "ERROR" });
  return NextResponse.json({ ok: true });
}
