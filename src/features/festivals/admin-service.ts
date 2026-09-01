import { db } from "@/lib/db";
import type { Session } from "next-auth";
import type { ContentStatus, ContentPopularity, DateConfidence, VerificationStatus } from "@prisma/client";
import { requireAdmin, friendlyDbError } from "@/features/admin/service";
import { audit } from "@/lib/audit";
import { ensureUniqueSlug } from "@/lib/slug";

export interface AdminFestivalListFilters {
  search?: string;
  status?: ContentStatus;
  categoryId?: string;
  verification?: VerificationStatus;
  page?: number;
}

/** The admin table's list query — unlike every public query, this intentionally has NO status filter (spec §7/§27: admins must see drafts). */
export async function adminListFestivals(session: Session | null, filters: AdminFestivalListFilters = {}) {
  requireAdmin(session);
  const page = filters.page ?? 1;
  const pageSize = 25;

  const where = {
    status: filters.status,
    categoryId: filters.categoryId,
    verificationStatus: filters.verification,
    name: filters.search ? { contains: filters.search, mode: "insensitive" as const } : undefined,
  };

  const [items, total] = await Promise.all([
    db.festival.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        popularity: true,
        featured: true,
        verificationStatus: true,
        updatedAt: true,
        category: { select: { name: true } },
        location: { select: { name: true } },
        occurrences: { orderBy: { year: "desc" }, take: 1, select: { year: true, dateConfidence: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.festival.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function adminGetFestival(session: Session | null, id: string) {
  requireAdmin(session);
  return db.festival.findUnique({
    where: { id },
    include: {
      category: true,
      tags: true,
      travellerFitTags: true,
      occurrences: { orderBy: { year: "desc" } },
      location: true,
      destinations: { select: { id: true, name: true, slug: true } },
      experiences: { select: { id: true, name: true, slug: true } },
      foods: { select: { id: true, name: true, slug: true } },
    },
  });
}

export interface FestivalWriteInput {
  name: string;
  slug?: string;
  description: string;
  categoryId: string;
  status?: ContentStatus;
  popularity?: ContentPopularity;
  featured?: boolean;
  locationId: string;
  latitude?: number;
  longitude?: number;
  precision?: "EXACT" | "APPROXIMATE";
  recurrenceType?: "ANNUAL_FIXED_DATE" | "ANNUAL_LUNAR_OR_REGIONAL_CALENDAR" | "ANNUAL_VARIABLE" | "ONE_TIME" | "IRREGULAR";
  recurrenceNotes?: string;
  typicalDurationDays?: number;
  tagIds?: string[];
  travellerFitTagIds?: string[];
  destinationIds?: string[];
  experienceIds?: string[];
  foodIds?: string[];
}

export async function adminCreateFestival(session: Session | null, input: FestivalWriteInput) {
  requireAdmin(session);

  const slug = await ensureUniqueSlug(input.slug || input.name, async (candidate) => (await db.festival.count({ where: { slug: candidate } })) > 0);

  try {
    const festival = await db.festival.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        categoryId: input.categoryId,
        status: input.status,
        popularity: input.popularity,
        featured: input.featured,
        locationId: input.locationId,
        latitude: input.latitude,
        longitude: input.longitude,
        precision: input.precision,
        recurrenceType: input.recurrenceType,
        recurrenceNotes: input.recurrenceNotes,
        typicalDurationDays: input.typicalDurationDays,
        tags: input.tagIds?.length ? { connect: input.tagIds.map((id) => ({ id })) } : undefined,
        travellerFitTags: input.travellerFitTagIds?.length ? { connect: input.travellerFitTagIds.map((id) => ({ id })) } : undefined,
        destinations: input.destinationIds?.length ? { connect: input.destinationIds.map((id) => ({ id })) } : undefined,
        experiences: input.experienceIds?.length ? { connect: input.experienceIds.map((id) => ({ id })) } : undefined,
        foods: input.foodIds?.length ? { connect: input.foodIds.map((id) => ({ id })) } : undefined,
      },
    });

    await audit.record({ adminId: session.user.id, action: "created", entityType: "FESTIVAL", entityId: festival.id, entityLabel: festival.name });
    return festival;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

export async function adminUpdateFestival(session: Session | null, id: string, input: Partial<FestivalWriteInput>) {
  requireAdmin(session);

  const existing = await db.festival.findUnique({ where: { id }, select: { name: true, slug: true } });
  if (!existing) throw new Error("Festival not found");

  const slug = input.slug || input.name ? await ensureUniqueSlug(input.slug || input.name || existing.name, async (candidate) => candidate !== existing.slug && (await db.festival.count({ where: { slug: candidate } })) > 0) : undefined;

  try {
    const festival = await db.festival.update({
      where: { id },
      data: {
        name: input.name,
        slug,
        description: input.description,
        categoryId: input.categoryId,
        status: input.status,
        popularity: input.popularity,
        featured: input.featured,
        locationId: input.locationId,
        latitude: input.latitude,
        longitude: input.longitude,
        precision: input.precision,
        recurrenceType: input.recurrenceType,
        recurrenceNotes: input.recurrenceNotes,
        typicalDurationDays: input.typicalDurationDays,
        tags: input.tagIds ? { set: input.tagIds.map((tagId) => ({ id: tagId })) } : undefined,
        travellerFitTags: input.travellerFitTagIds ? { set: input.travellerFitTagIds.map((tagId) => ({ id: tagId })) } : undefined,
        destinations: input.destinationIds ? { set: input.destinationIds.map((destId) => ({ id: destId })) } : undefined,
        experiences: input.experienceIds ? { set: input.experienceIds.map((expId) => ({ id: expId })) } : undefined,
        foods: input.foodIds ? { set: input.foodIds.map((foodId) => ({ id: foodId })) } : undefined,
      },
    });

    await audit.record({ adminId: session.user.id, action: "updated", entityType: "FESTIVAL", entityId: festival.id, entityLabel: festival.name });
    return festival;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

/** Publish/unpublish/archive — the one action every admin table row exposes directly, spec §27. */
export async function adminSetFestivalStatus(session: Session | null, id: string, status: ContentStatus) {
  requireAdmin(session);
  try {
    const festival = await db.festival.update({ where: { id }, data: { status }, select: { id: true, name: true, status: true } });
    await audit.record({ adminId: session.user.id, action: status === "PUBLISHED" ? "published" : status === "ARCHIVED" ? "archived" : "unpublished", entityType: "FESTIVAL", entityId: id, entityLabel: festival.name });
    return festival;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

export interface OccurrenceInput {
  year: number;
  startDate?: Date;
  endDate?: Date;
  dateConfidence: DateConfidence;
  source?: string;
  notes?: string;
}

/**
 * Create-or-update, keyed by the schema's own `@@unique([festivalId, year])`
 * (spec §10: "if an expected date becomes confirmed, admin can update it" —
 * same year, new confidence, not a new row). Never silently overwrites a
 * *different* year's row.
 */
export async function adminUpsertFestivalOccurrence(session: Session | null, festivalId: string, input: OccurrenceInput) {
  requireAdmin(session);

  const festival = await db.festival.findUnique({ where: { id: festivalId }, select: { name: true } });
  if (!festival) throw new Error("Festival not found");

  try {
    const occurrence = await db.festivalOccurrence.upsert({
      where: { festivalId_year: { festivalId, year: input.year } },
      create: {
        festivalId,
        year: input.year,
        startDate: input.startDate,
        endDate: input.endDate,
        dateConfidence: input.dateConfidence,
        source: input.source,
        notes: input.notes,
        ...(input.dateConfidence === "ADMIN_VERIFIED" ? { verifiedByUserId: session.user.id, verifiedAt: new Date() } : {}),
      },
      update: {
        startDate: input.startDate,
        endDate: input.endDate,
        dateConfidence: input.dateConfidence,
        source: input.source,
        notes: input.notes,
        ...(input.dateConfidence === "ADMIN_VERIFIED" ? { verifiedByUserId: session.user.id, verifiedAt: new Date() } : {}),
      },
    });

    await audit.record({
      adminId: session.user.id,
      action: "date_updated",
      entityType: "FESTIVAL_OCCURRENCE",
      entityId: occurrence.id,
      entityLabel: `${festival.name} (${input.year})`,
      metadata: { year: input.year, dateConfidence: input.dateConfidence },
    });
    return occurrence;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

export async function adminSetFestivalVerification(session: Session | null, id: string, verificationStatus: VerificationStatus, verificationSource?: string) {
  requireAdmin(session);
  try {
    const festival = await db.festival.update({
      where: { id },
      data: { verificationStatus, verificationSource, lastVerifiedAt: new Date() },
      select: { id: true, name: true },
    });
    await audit.record({ adminId: session.user.id, action: "verification_updated", entityType: "FESTIVAL", entityId: id, entityLabel: festival.name, metadata: { verificationStatus } });
    return festival;
  } catch (error) {
    throw friendlyDbError(error);
  }
}
