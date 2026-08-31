import { db } from "@/lib/db";
import type { Session } from "next-auth";
import { Prisma } from "@prisma/client";
import { STALE_VERIFICATION_DAYS } from "./constants";

export class UnauthorizedError extends Error {
  constructor() {
    super("Admin access required");
    this.name = "UnauthorizedError";
  }
}

/** Thrown when a mutation is blocked by a real FK/relationship, translated from Prisma's P2003 — see `friendlyDbError`. */
export class RelationshipInUseError extends Error {
  constructor(message = "This item is still referenced by other content and can't be removed.") {
    super(message);
    this.name = "RelationshipInUseError";
  }
}

/** Guard for every admin service/route — throws rather than silently no-op-ing. */
export function requireAdmin(session: Session | null): asserts session is Session {
  if (!session || session.user.role !== "ADMIN") {
    throw new UnauthorizedError();
  }
}

/**
 * Server-side actions/routes must never leak a raw Postgres/Prisma error
 * (spec §45: "never expose stack traces"). The one case worth a specific,
 * actionable message is a foreign-key restriction (P2003) — e.g. deleting a
 * Location that still has content pointing at it — everything else becomes
 * a generic message.
 */
export function friendlyDbError(error: unknown): Error {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
    return new RelationshipInUseError();
  }
  return new Error("Something went wrong saving this. Please try again.");
}

/** Example admin write path: promotes a festival occurrence's date to admin-verified. */
export async function verifyFestivalOccurrence(
  session: Session | null,
  occurrenceId: string,
  input: { startDate?: Date; endDate?: Date }
) {
  requireAdmin(session);

  return db.festivalOccurrence.update({
    where: { id: occurrenceId },
    data: {
      startDate: input.startDate,
      endDate: input.endDate,
      dateConfidence: "ADMIN_VERIFIED",
      verifiedByUserId: session.user.id,
      verifiedAt: new Date(),
    },
  });
}

/** Dashboard counts (spec §6) — real numbers, not vanity metrics: totals plus everything that needs attention. */
export async function getDashboardStats(session: Session | null) {
  requireAdmin(session);

  const staleBefore = new Date(Date.now() - STALE_VERIFICATION_DAYS * 24 * 60 * 60 * 1000);

  const [
    festivalCount,
    destinationCount,
    experienceCount,
    foodCount,
    festivalsMissingDates,
    festivalsExpectedDates,
    destinationsUnverified,
    festivalsMissingImages,
    destinationsMissingImages,
    staleFestivals,
    recentAudit,
  ] = await Promise.all([
    db.festival.count(),
    db.destination.count(),
    db.experience.count(),
    db.food.count(),
    db.festival.count({ where: { occurrences: { none: {} } } }),
    db.festival.count({ where: { occurrences: { some: { dateConfidence: { in: ["EXPECTED", "AI_SUGGESTED", "NOT_ANNOUNCED"] } } } } }),
    db.destination.count({ where: { verificationStatus: "UNVERIFIED" } }),
    db.festival.findMany({ select: { id: true } }).then(async (rows) => {
      const withMedia = await db.media.groupBy({ by: ["contentId"], where: { contentType: "FESTIVAL", contentId: { in: rows.map((r) => r.id) } } });
      return rows.length - withMedia.length;
    }),
    db.destination.findMany({ select: { id: true } }).then(async (rows) => {
      const withMedia = await db.media.groupBy({ by: ["contentId"], where: { contentType: "DESTINATION", contentId: { in: rows.map((r) => r.id) } } });
      return rows.length - withMedia.length;
    }),
    db.festival.count({ where: { lastVerifiedAt: { lt: staleBefore } } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { admin: { select: { name: true, email: true } } } }),
  ]);

  return {
    totals: { festivals: festivalCount, destinations: destinationCount, experiences: experienceCount, food: foodCount },
    needsAttention: {
      festivalsMissingDates,
      festivalsExpectedDates,
      destinationsUnverified,
      festivalsMissingImages,
      destinationsMissingImages,
      staleFestivals,
    },
    recentActivity: recentAudit,
  };
}
