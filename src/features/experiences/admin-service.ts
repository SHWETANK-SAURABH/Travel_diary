import { db } from "@/lib/db";
import type { Session } from "next-auth";
import type { ContentStatus } from "@prisma/client";
import { requireAdmin, friendlyDbError } from "@/features/admin/service";
import { audit } from "@/lib/audit";
import { ensureUniqueSlug } from "@/lib/slug";

export interface AdminExperienceListFilters {
  search?: string;
  status?: ContentStatus;
  page?: number;
}

export async function adminListExperiences(session: Session | null, filters: AdminExperienceListFilters = {}) {
  requireAdmin(session);
  const page = filters.page ?? 1;
  const pageSize = 25;
  const where = {
    status: filters.status,
    name: filters.search ? { contains: filters.search, mode: "insensitive" as const } : undefined,
  };

  const [items, total] = await Promise.all([
    db.experience.findMany({
      where,
      select: { id: true, slug: true, name: true, status: true, featured: true, category: true, updatedAt: true, location: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.experience.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function adminGetExperience(session: Session | null, id: string) {
  requireAdmin(session);
  return db.experience.findUnique({
    where: { id },
    include: { tags: true, location: true, destinations: { select: { id: true, name: true, slug: true } }, festivals: { select: { id: true, name: true, slug: true } } },
  });
}

export interface ExperienceWriteInput {
  name: string;
  slug?: string;
  description: string;
  category?: string;
  status?: ContentStatus;
  featured?: boolean;
  locationId: string;
  latitude?: number;
  longitude?: number;
  tagIds?: string[];
  destinationIds?: string[];
  festivalIds?: string[];
}

export async function adminCreateExperience(session: Session | null, input: ExperienceWriteInput) {
  requireAdmin(session);
  const slug = await ensureUniqueSlug(input.slug || input.name, async (candidate) => (await db.experience.count({ where: { slug: candidate } })) > 0);
  try {
    const experience = await db.experience.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        category: input.category,
        status: input.status,
        featured: input.featured,
        locationId: input.locationId,
        latitude: input.latitude,
        longitude: input.longitude,
        tags: input.tagIds?.length ? { connect: input.tagIds.map((id) => ({ id })) } : undefined,
        destinations: input.destinationIds?.length ? { connect: input.destinationIds.map((id) => ({ id })) } : undefined,
        festivals: input.festivalIds?.length ? { connect: input.festivalIds.map((id) => ({ id })) } : undefined,
      },
    });
    await audit.record({ adminId: session.user.id, action: "created", entityType: "EXPERIENCE", entityId: experience.id, entityLabel: experience.name });
    return experience;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

export async function adminUpdateExperience(session: Session | null, id: string, input: Partial<ExperienceWriteInput>) {
  requireAdmin(session);
  const existing = await db.experience.findUnique({ where: { id }, select: { name: true, slug: true } });
  if (!existing) throw new Error("Experience not found");
  const slug = input.slug || input.name ? await ensureUniqueSlug(input.slug || input.name || existing.name, async (candidate) => candidate !== existing.slug && (await db.experience.count({ where: { slug: candidate } })) > 0) : undefined;

  try {
    const experience = await db.experience.update({
      where: { id },
      data: {
        name: input.name,
        slug,
        description: input.description,
        category: input.category,
        status: input.status,
        featured: input.featured,
        locationId: input.locationId,
        latitude: input.latitude,
        longitude: input.longitude,
        tags: input.tagIds ? { set: input.tagIds.map((tagId) => ({ id: tagId })) } : undefined,
        destinations: input.destinationIds ? { set: input.destinationIds.map((destId) => ({ id: destId })) } : undefined,
        festivals: input.festivalIds ? { set: input.festivalIds.map((festId) => ({ id: festId })) } : undefined,
      },
    });
    await audit.record({ adminId: session.user.id, action: "updated", entityType: "EXPERIENCE", entityId: experience.id, entityLabel: experience.name });
    return experience;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

export async function adminSetExperienceStatus(session: Session | null, id: string, status: ContentStatus) {
  requireAdmin(session);
  const experience = await db.experience.update({ where: { id }, data: { status }, select: { id: true, name: true } });
  await audit.record({ adminId: session.user.id, action: status === "PUBLISHED" ? "published" : status === "ARCHIVED" ? "archived" : "unpublished", entityType: "EXPERIENCE", entityId: id, entityLabel: experience.name });
  return experience;
}
