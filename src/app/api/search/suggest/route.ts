import { NextResponse } from "next/server";
import { search } from "@/features/search/service";
import { searchQuerySchema } from "@/lib/validation";

/** Debounced live-suggestions endpoint for the header search overlay — the /search page calls the service directly instead, since it's already server-rendered. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ query: "", results: [], usedFuzzyMatch: false });
  }

  const response = await search(parsed.data.q, undefined, parsed.data.anonId);
  return NextResponse.json(response);
}
