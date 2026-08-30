import { NextResponse } from "next/server";
import { getSearchSuggestions } from "@/features/search/service";

/** Empty-state fallback content for the search overlay/page — fetched lazily, only once a query has actually come up empty. */
export async function GET() {
  const suggestions = await getSearchSuggestions();
  return NextResponse.json(suggestions);
}
