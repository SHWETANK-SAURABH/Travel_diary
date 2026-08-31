import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin, UnauthorizedError } from "@/features/admin/service";
import { containsInsensitive } from "@/lib/search";

const SEARCHERS: Record<string, (q: string) => Promise<{ id: string; name: string }[]>> = {
  festival: (q) => db.festival.findMany({ where: { name: containsInsensitive(q) }, select: { id: true, name: true }, take: 20 }),
  destination: (q) => db.destination.findMany({ where: { name: containsInsensitive(q) }, select: { id: true, name: true }, take: 20 }),
  experience: (q) => db.experience.findMany({ where: { name: containsInsensitive(q) }, select: { id: true, name: true }, take: 20 }),
  food: (q) => db.food.findMany({ where: { name: containsInsensitive(q) }, select: { id: true, name: true }, take: 20 }),
  location: (q) => db.location.findMany({ where: { name: containsInsensitive(q) }, select: { id: true, name: true }, take: 20 }),
  tag: (q) => db.tag.findMany({ where: { name: containsInsensitive(q), archived: false }, select: { id: true, name: true }, take: 20 }),
  festivalCategory: (q) => db.festivalCategory.findMany({ where: { name: containsInsensitive(q) }, select: { id: true, name: true }, take: 20 }),
  destinationCategory: (q) => db.destinationCategory.findMany({ where: { name: containsInsensitive(q) }, select: { id: true, name: true }, take: 20 }),
};

/**
 * The one search endpoint every admin relationship/tag/category picker
 * calls (spec §12/§40: "searchable relationship selectors... do not
 * require admins to enter IDs manually"). Admin-gated like every other
 * admin route — this deliberately includes non-PUBLISHED content (an
 * admin connecting two drafts together is normal), unlike every public
 * search path.
 */
export async function GET(request: Request) {
  const session = await auth();
  try {
    requireAdmin(session);
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    throw error;
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "";
  const q = (searchParams.get("q") ?? "").trim();

  const searcher = SEARCHERS[type];
  if (!searcher) return NextResponse.json({ error: "Unknown search type" }, { status: 400 });
  if (q.length < 1) return NextResponse.json({ results: [] });

  const results = await searcher(q);
  return NextResponse.json({ results });
}
