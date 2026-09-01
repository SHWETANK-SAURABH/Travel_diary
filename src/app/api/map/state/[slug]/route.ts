import { NextResponse } from "next/server";
import { getStateSummary } from "@/features/map/service";
import { stateSummaryQuerySchema } from "@/lib/validation";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const parsed = stateSummaryQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query", issues: parsed.error.issues }, { status: 400 });
  }

  const summary = await getStateSummary(slug, parsed.data.month);
  if (!summary) {
    return NextResponse.json({ error: "State not found" }, { status: 404 });
  }

  return NextResponse.json(summary);
}
