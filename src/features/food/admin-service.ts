import { db } from "@/lib/db";
import type { Session } from "next-auth";
import type { ContentStatus } from "@prisma/client";
import { requireAdmin, friendlyDbError } from "@/features/admin/service";
import { audit } from "@/lib/audit";
import { ensureUniqueSlug } from "@/lib/slug";

export interface AdminFoodListFilters {
  search?: string;
  status?: ContentStatus;
  page?: number;
}

export async function adminListFood(session: Session | null, filters: AdminFoodListFilters = {}) {
  requireAdmin(session);
  const page = filters.page ?? 1;
  const pageSize = 25;
  const where = {
    status: filters.status,
    name: filters.search ? { contains: filters.search, mode: "insensitive" as const } : undefined,
  };

  const [items, total] = await Promise.all([
    db.food.findMany({
      where,
      select: { id: true, slug: true, name: true, status: true, featured: true, region: true, updatedAt: true, location: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.food.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function adminGetFood(session: Session | null, id: string) {
  requireAdmin(session);
  return db.food.findUnique({
    where: { id },
    include: { tags: true, location: true, destinations: { select: { id: true, name: true, slug: true } }, festivals: { select: { id: true, name: true, slug: true } } },
  });
}

export interface FoodWriteInput {
  name: string;
  slug?: string;
  description: string;
  region?: string;
  status?: ContentStatus;
  featured?: boolean;
  locationId?: string;
  tagIds?: string[];
  destinationIds?: string[];
  festivalIds?: string[];
}

export async function adminCreateFood(session: Session | null, input: FoodWriteInput) {
  requireAdmin(session);
  const slug = await ensureUniqueSlug(input.slug || input.name, async (candidate) => (await db.food.count({ where: { slug: candidate } })) > 0);
  try {
    const food = await db.food.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        region: input.region,
        status: input.status,
        featured: input.featured,
        locationId: input.locationId,
        tags: input.tagIds?.length ? { connect: input.tagIds.map((id) => ({ id })) } : undefined,
        destinations: input.destinationIds?.length ? { connect: input.destinationIds.map((id) => ({ id })) } : undefined,
        festivals: input.festivalIds?.length ? { connect: input.festivalIds.map((id) => ({ id })) } : undefined,
      },
    });
    await audit.record({ adminId: session.user.id, action: "created", entityType: "FOOD", entityId: food.id, entityLabel: food.name });
    return food;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

export async function adminUpdateFood(session: Session | null, id: string, input: Partial<FoodWriteInput>) {
  requireAdmin(session);
  const existing = await db.food.findUnique({ where: { id }, select: { name: true, slug: true } });
  if (!existing) throw new Error("Food not found");
  const slug = input.slug || input.name ? await ensureUniqueSlug(input.slug || input.name || existing.name, async (candidate) => candidate !== existing.slug && (await db.food.count({ where: { slug: candidate } })) > 0) : undefined;

  try {
    const food = await db.food.update({
      where: { id },
      data: {
        name: input.name,
        slug,
        description: input.description,
        region: input.region,
        status: input.status,
        featured: input.featured,
        locationId: input.locationId,
        tags: input.tagIds ? { set: input.tagIds.map((tagId) => ({ id: tagId })) } : undefined,
        destinations: input.destinationIds ? { set: input.destinationIds.map((destId) => ({ id: destId })) } : undefined,
        festivals: input.festivalIds ? { set: input.festivalIds.map((festId) => ({ id: festId })) } : undefined,
      },
    });
    await audit.record({ adminId: session.user.id, action: "updated", entityType: "FOOD", entityId: food.id, entityLabel: food.name });
    return food;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

export async function adminSetFoodStatus(session: Session | null, id: string, status: ContentStatus) {
  requireAdmin(session);
  try {
    const food = await db.food.update({ where: { id }, data: { status }, select: { id: true, name: true } });
    await audit.record({ adminId: session.user.id, action: status === "PUBLISHED" ? "published" : status === "ARCHIVED" ? "archived" : "unpublished", entityType: "FOOD", entityId: id, entityLabel: food.name });
    return food;
  } catch (error) {
    throw friendlyDbError(error);
  }
}
