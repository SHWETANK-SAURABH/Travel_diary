import { NextResponse } from "next/server";
import { mapSearch } from "@/features/map/service";
import { mapSearchQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = mapSearchQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ results: [] });
  }

  const results = await mapSearch(parsed.data.q);
  return NextResponse.json({ results });
}
