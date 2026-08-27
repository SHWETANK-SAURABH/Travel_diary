import { NextResponse } from "next/server";
import { getViewportContent } from "@/features/map/service";
import { viewportQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = viewportQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid viewport query", issues: parsed.error.issues }, { status: 400 });
  }

  const { minLat, minLng, maxLat, maxLng, month } = parsed.data;
  const discoveries = await getViewportContent({
    box: { minLat, minLng, maxLat, maxLng },
    month,
  });

  return NextResponse.json({ discoveries });
}
