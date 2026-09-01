import { db } from "@/lib/db";
import type { Session } from "next-auth";
import type { ContentStatus, ContentPopularity, VerificationStatus, BudgetLevel } from "@prisma/client";
import { requireAdmin, friendlyDbError } from "@/features/admin/service";
import { audit } from "@/lib/audit";
import { ensureUniqueSlug } from "@/lib/slug";

export interface AdminDestinationListFilters {
  search?: string;
  status?: ContentStatus;
  categoryId?: string;
  verification?: VerificationStatus;
  page?: number;
}

export async function adminListDestinations(session: Session | null, filters: AdminDestinationListFilters = {}) {
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
    db.destination.findMany({
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
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.destination.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function adminGetDestination(session: Session | null, id: string) {
  requireAdmin(session);
  return db.destination.findUnique({
    where: { id },
    include: {
      category: true,
      tags: true,
      location: true,
      experiences: { select: { id: true, name: true, slug: true } },
      foods: { select: { id: true, name: true, slug: true } },
      festivals: { select: { id: true, name: true, slug: true } },
    },
  });
}

export interface DestinationWriteInput {
  name: string;
  slug?: string;
  description: string;
  categoryId?: string;
  status?: ContentStatus;
  popularity?: ContentPopularity;
  featured?: boolean;
  locationId: string;
  latitude?: number;
  longitude?: number;
  precision?: "EXACT" | "APPROXIMATE";
  bestTimeStartMonth?: number;
  bestTimeEndMonth?: number;
  altTimeStartMonth?: number;
  altTimeEndMonth?: number;
  bestTimeExplanation?: string;
  bestTimeSource?: VerificationStatus;
  budgetLevel?: BudgetLevel;
  approximateCostPerDay?: number;
  tagIds?: string[];
  experienceIds?: string[];
  foodIds?: string[];
}

export async function adminCreateDestination(session: Session | null, input: DestinationWriteInput) {
  requireAdmin(session);
  const slug = await ensureUniqueSlug(input.slug || input.name, async (candidate) => (await db.destination.count({ where: { slug: candidate } })) > 0);

  try {
    const destination = await db.destination.create({
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
        bestTimeStartMonth: input.bestTimeStartMonth,
        bestTimeEndMonth: input.bestTimeEndMonth,
        altTimeStartMonth: input.altTimeStartMonth,
        altTimeEndMonth: input.altTimeEndMonth,
        bestTimeExplanation: input.bestTimeExplanation,
        bestTimeSource: input.bestTimeSource,
        budgetLevel: input.budgetLevel,
        approximateCostPerDay: input.approximateCostPerDay,
        tags: input.tagIds?.length ? { connect: input.tagIds.map((id) => ({ id })) } : undefined,
        experiences: input.experienceIds?.length ? { connect: input.experienceIds.map((id) => ({ id })) } : undefined,
        foods: input.foodIds?.length ? { connect: input.foodIds.map((id) => ({ id })) } : undefined,
      },
    });
    await audit.record({ adminId: session.user.id, action: "created", entityType: "DESTINATION", entityId: destination.id, entityLabel: destination.name });
    return destination;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

export async function adminUpdateDestination(session: Session | null, id: string, input: Partial<DestinationWriteInput>) {
  requireAdmin(session);
  const existing = await db.destination.findUnique({ where: { id }, select: { name: true, slug: true, bestTimeStartMonth: true, bestTimeEndMonth: true, bestTimeSource: true } });
  if (!existing) throw new Error("Destination not found");

  const slug = input.slug || input.name ? await ensureUniqueSlug(input.slug || input.name || existing.name, async (candidate) => candidate !== existing.slug && (await db.destination.count({ where: { slug: candidate } })) > 0) : undefined;

  // "Do not destroy the original system suggestion when an admin overrides it" (spec §15): the prior
  // best-time value + its source are captured in the audit trail whenever an admin changes it, since
  // there's no separate storage column for "system suggestion" vs "admin decision" today — see
  // docs/architecture.md for the full reasoning.
  const bestTimeChanged =
    (input.bestTimeStartMonth !== undefined && input.bestTimeStartMonth !== existing.bestTimeStartMonth) ||
    (input.bestTimeEndMonth !== undefined && input.bestTimeEndMonth !== existing.bestTimeEndMonth);

  try {
    const destination = await db.destination.update({
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
        bestTimeStartMonth: input.bestTimeStartMonth,
        bestTimeEndMonth: input.bestTimeEndMonth,
        altTimeStartMonth: input.altTimeStartMonth,
        altTimeEndMonth: input.altTimeEndMonth,
        bestTimeExplanation: input.bestTimeExplanation,
        bestTimeSource: bestTimeChanged ? "ADMIN_OVERRIDDEN" : input.bestTimeSource,
        budgetLevel: input.budgetLevel,
        approximateCostPerDay: input.approximateCostPerDay,
        tags: input.tagIds ? { set: input.tagIds.map((tagId) => ({ id: tagId })) } : undefined,
        experiences: input.experienceIds ? { set: input.experienceIds.map((expId) => ({ id: expId })) } : undefined,
        foods: input.foodIds ? { set: input.foodIds.map((foodId) => ({ id: foodId })) } : undefined,
      },
    });

    if (bestTimeChanged) {
      await audit.record({
        adminId: session.user.id,
        action: "best_time_overridden",
        entityType: "DESTINATION",
        entityId: id,
        entityLabel: destination.name,
        metadata: {
          before: { startMonth: existing.bestTimeStartMonth, endMonth: existing.bestTimeEndMonth, source: existing.bestTimeSource },
          after: { startMonth: input.bestTimeStartMonth, endMonth: input.bestTimeEndMonth, source: "ADMIN_OVERRIDDEN" },
        },
      });
    }
    await audit.record({ adminId: session.user.id, action: "updated", entityType: "DESTINATION", entityId: destination.id, entityLabel: destination.name });
    return destination;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

export async function adminSetDestinationStatus(session: Session | null, id: string, status: ContentStatus) {
  requireAdmin(session);
  try {
    const destination = await db.destination.update({ where: { id }, data: { status }, select: { id: true, name: true } });
    await audit.record({ adminId: session.user.id, action: status === "PUBLISHED" ? "published" : status === "ARCHIVED" ? "archived" : "unpublished", entityType: "DESTINATION", entityId: id, entityLabel: destination.name });
    return destination;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

/** Mark the best-time recommendation reviewed/confirmed as-is, without changing the value itself. */
export async function adminVerifyDestinationBestTime(session: Session | null, id: string) {
  requireAdmin(session);
  try {
    const destination = await db.destination.update({ where: { id }, data: { bestTimeSource: "ADMIN_VERIFIED", verificationStatus: "ADMIN_VERIFIED", lastVerifiedAt: new Date() }, select: { id: true, name: true } });
    await audit.record({ adminId: session.user.id, action: "best_time_verified", entityType: "DESTINATION", entityId: id, entityLabel: destination.name });
    return destination;
  } catch (error) {
    throw friendlyDbError(error);
  }
}
