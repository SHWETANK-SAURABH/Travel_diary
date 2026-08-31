import type { ContentType } from "@prisma/client";
import { db } from "@/lib/db";
import { mediaForMany } from "@/lib/media";

/**
 * A resolved `(contentType, contentId)` pair — the polymorphic shape
 * SavedContent/VisitedContent/TripItem all store, per the trade-off
 * documented on the Media model in schema.prisma. `href`/`slug` are null
 * for content types with no public detail page yet (Experience, Food,
 * Event). `latitude`/`longitude` are null unless the content has its own
 * coordinates (Festival/Destination; Experience/Food/Event don't carry
 * their own point today) — used for trip map plotting.
 */
export interface ResolvedContentItem {
  contentType: ContentType;
  id: string;
  name: string;
  slug: string | null;
  href: string | null;
  locationName: string | null;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Batches per content type (one query per type present, not one per row)
 * rather than resolving each row individually. A row whose target no
 * longer exists (deleted content) is silently dropped rather than
 * crashing the whole list — the service layer owns this integrity, not
 * the database, the same trade-off documented on the Media model.
 * Shared by Saved/Visited lists (Phase 8) and trip itineraries (Phase 9) —
 * the exact same "polymorphic id -> real record" problem either way.
 */
export async function resolveContentRecords(records: { contentType: ContentType; contentId: string }[]): Promise<ResolvedContentItem[]> {
  const idsByType = new Map<ContentType, string[]>();
  for (const record of records) {
    idsByType.set(record.contentType, [...(idsByType.get(record.contentType) ?? []), record.contentId]);
  }

  const [festivals, destinations, experiences, foods, events] = await Promise.all([
    idsByType.has("FESTIVAL")
      ? db.festival.findMany({ where: { id: { in: idsByType.get("FESTIVAL")! } }, select: { id: true, slug: true, name: true, latitude: true, longitude: true, location: { select: { name: true } } } })
      : [],
    idsByType.has("DESTINATION")
      ? db.destination.findMany({ where: { id: { in: idsByType.get("DESTINATION")! } }, select: { id: true, slug: true, name: true, latitude: true, longitude: true, location: { select: { name: true } } } })
      : [],
    idsByType.has("EXPERIENCE")
      ? db.experience.findMany({ where: { id: { in: idsByType.get("EXPERIENCE")! } }, select: { id: true, slug: true, name: true, latitude: true, longitude: true, location: { select: { name: true } } } })
      : [],
    idsByType.has("FOOD") ? db.food.findMany({ where: { id: { in: idsByType.get("FOOD")! } }, select: { id: true, slug: true, name: true, region: true } }) : [],
    idsByType.has("EVENT")
      ? db.event.findMany({ where: { id: { in: idsByType.get("EVENT")! } }, select: { id: true, name: true, location: { select: { name: true, latitude: true, longitude: true } } } })
      : [],
  ]);

  const [festivalMedia, destinationMedia] = await Promise.all([
    mediaForMany(
      "FESTIVAL",
      festivals.map((f) => f.id)
    ),
    mediaForMany(
      "DESTINATION",
      destinations.map((d) => d.id)
    ),
  ]);

  const byKey = new Map<string, ResolvedContentItem>();
  for (const f of festivals) {
    byKey.set(`FESTIVAL:${f.id}`, { contentType: "FESTIVAL", id: f.id, name: f.name, slug: f.slug, href: `/festivals/${f.slug}`, locationName: f.location.name, imageUrl: festivalMedia.get(f.id)?.[0]?.url ?? null, latitude: f.latitude, longitude: f.longitude });
  }
  for (const d of destinations) {
    byKey.set(`DESTINATION:${d.id}`, { contentType: "DESTINATION", id: d.id, name: d.name, slug: d.slug, href: `/destinations/${d.slug}`, locationName: d.location.name, imageUrl: destinationMedia.get(d.id)?.[0]?.url ?? null, latitude: d.latitude, longitude: d.longitude });
  }
  for (const e of experiences) {
    byKey.set(`EXPERIENCE:${e.id}`, { contentType: "EXPERIENCE", id: e.id, name: e.name, slug: e.slug, href: null, locationName: e.location.name, imageUrl: null, latitude: e.latitude, longitude: e.longitude });
  }
  for (const f of foods) {
    byKey.set(`FOOD:${f.id}`, { contentType: "FOOD", id: f.id, name: f.name, slug: f.slug, href: null, locationName: f.region, imageUrl: null, latitude: null, longitude: null });
  }
  for (const ev of events) {
    byKey.set(`EVENT:${ev.id}`, { contentType: "EVENT", id: ev.id, name: ev.name, slug: null, href: null, locationName: ev.location?.name ?? null, imageUrl: null, latitude: ev.location?.latitude ?? null, longitude: ev.location?.longitude ?? null });
  }

  return records.map((r) => byKey.get(`${r.contentType}:${r.contentId}`)).filter((item): item is ResolvedContentItem => item != null);
}
