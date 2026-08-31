import { db } from "@/lib/db";
import type { Session } from "next-auth";
import { requireAdmin } from "./service";
import { STALE_VERIFICATION_DAYS } from "./constants";

/**
 * Powers `/admin/verification` (spec §33): every queue is a direct,
 * explainable query against fields that already exist — no separate
 * "verification" storage of its own. Each row carries enough (id + slug)
 * for the admin UI to link straight into the relevant edit page (spec:
 * "allow admins to open the relevant edit page directly").
 */
export async function getVerificationQueue(session: Session | null) {
  requireAdmin(session);

  const staleBefore = new Date(Date.now() - STALE_VERIFICATION_DAYS * 24 * 60 * 60 * 1000);

  const [festivalsMissingDates, festivalsUncertainDates, destinationsUnverified, staleFestivals, staleDestinations] = await Promise.all([
    db.festival.findMany({
      where: { occurrences: { none: {} } },
      select: { id: true, slug: true, name: true, status: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    db.festival.findMany({
      where: { occurrences: { some: { dateConfidence: { in: ["EXPECTED", "AI_SUGGESTED", "NOT_ANNOUNCED"] } } } },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        occurrences: { orderBy: { year: "desc" }, take: 1, select: { year: true, dateConfidence: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    db.destination.findMany({
      where: { verificationStatus: "UNVERIFIED" },
      select: { id: true, slug: true, name: true, status: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    db.festival.findMany({
      where: { OR: [{ lastVerifiedAt: null }, { lastVerifiedAt: { lt: staleBefore } }] },
      select: { id: true, slug: true, name: true, lastVerifiedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    db.destination.findMany({
      where: { OR: [{ lastVerifiedAt: null }, { lastVerifiedAt: { lt: staleBefore } }] },
      select: { id: true, slug: true, name: true, lastVerifiedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
  ]);

  const [festivalIds, destinationIds] = [
    await db.festival.findMany({ select: { id: true } }),
    await db.destination.findMany({ select: { id: true } }),
  ];
  const [festivalMedia, destinationMedia] = await Promise.all([
    db.media.groupBy({ by: ["contentId"], where: { contentType: "FESTIVAL", contentId: { in: festivalIds.map((f) => f.id) } } }),
    db.media.groupBy({ by: ["contentId"], where: { contentType: "DESTINATION", contentId: { in: destinationIds.map((d) => d.id) } } }),
  ]);
  const festivalsWithMedia = new Set(festivalMedia.map((m) => m.contentId));
  const destinationsWithMedia = new Set(destinationMedia.map((m) => m.contentId));

  const [festivalsMissingImages, destinationsMissingImages] = await Promise.all([
    db.festival.findMany({
      where: { id: { notIn: [...festivalsWithMedia] } },
      select: { id: true, slug: true, name: true, status: true },
      take: 100,
    }),
    db.destination.findMany({
      where: { id: { notIn: [...destinationsWithMedia] } },
      select: { id: true, slug: true, name: true, status: true },
      take: 100,
    }),
  ]);

  return {
    festivalsMissingDates,
    festivalsUncertainDates,
    destinationsUnverified,
    festivalsMissingImages,
    destinationsMissingImages,
    staleFestivals,
    staleDestinations,
  };
}
