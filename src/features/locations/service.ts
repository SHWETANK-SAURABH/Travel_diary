import { db } from "@/lib/db";

/**
 * Resolves a state's Location id plus every direct child (region/city)
 * Location id under it — content is usually linked to a city, not the
 * state itself, so "festivals in Kerala" means "locationId in this set",
 * not "locationId === Kerala's id".
 */
export async function getLocationIdsForState(stateSlug: string): Promise<string[]> {
  const state = await db.location.findFirst({
    where: { slug: stateSlug, type: "STATE" },
    select: { id: true },
  });
  if (!state) return [];

  const children = await db.location.findMany({
    where: { parentId: state.id },
    select: { id: true },
  });

  return [state.id, ...children.map((c) => c.id)];
}
