import { NextResponse } from "next/server";
import { getStateSummary } from "@/features/map/service";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month");
  const month = monthParam ? Number(monthParam) : undefined;

  const summary = await getStateSummary(slug, month && !Number.isNaN(month) ? month : undefined);
  if (!summary) {
    return NextResponse.json({ error: "State not found" }, { status: 404 });
  }

  return NextResponse.json(summary);
}
