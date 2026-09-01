import { db } from "@/lib/db";
import type { Session } from "next-auth";
import type { TagCategory } from "@prisma/client";
import { requireAdmin, friendlyDbError, RelationshipInUseError } from "@/features/admin/service";
import { audit } from "@/lib/audit";
import { ensureUniqueSlug, slugify } from "@/lib/slug";

export type CategoryDomain = "FESTIVAL_CATEGORY" | "DESTINATION_CATEGORY";

export interface CategoryWriteInput {
  name: string;
  slug?: string;
  description?: string;
  order?: number;
}

export async function adminListCategories(session: Session | null, domain: CategoryDomain) {
  requireAdmin(session);
  const [items, counts] =
    domain === "FESTIVAL_CATEGORY"
      ? await Promise.all([db.festivalCategory.findMany({ orderBy: { order: "asc" } }), db.festival.groupBy({ by: ["categoryId"], _count: true })])
      : await Promise.all([db.destinationCategory.findMany({ orderBy: { order: "asc" } }), db.destination.groupBy({ by: ["categoryId"], _count: true })]);
  const countByCategory = new Map(counts.map((c) => [c.categoryId, c._count]));
  return items.map((item) => ({ ...item, contentCount: countByCategory.get(item.id) ?? 0 }));
}

/** Slug uniqueness AND name-duplicate prevention (spec §23: "do not allow uncontrolled duplicate category names") — the DB only enforces unique slugs, so the case-insensitive name check happens here. */
export async function adminCreateCategory(session: Session | null, domain: CategoryDomain, input: CategoryWriteInput) {
  requireAdmin(session);
  const nameExists =
    domain === "FESTIVAL_CATEGORY"
      ? await db.festivalCategory.findFirst({ where: { name: { equals: input.name, mode: "insensitive" } } })
      : await db.destinationCategory.findFirst({ where: { name: { equals: input.name, mode: "insensitive" } } });
  if (nameExists) throw new Error(`A category named "${input.name}" already exists.`);

  const slug = await ensureUniqueSlug(input.slug || input.name, async (candidate) =>
    domain === "FESTIVAL_CATEGORY" ? (await db.festivalCategory.count({ where: { slug: candidate } })) > 0 : (await db.destinationCategory.count({ where: { slug: candidate } })) > 0
  );

  try {
    const category =
      domain === "FESTIVAL_CATEGORY"
        ? await db.festivalCategory.create({ data: { name: input.name, slug, description: input.description, order: input.order ?? 0 } })
        : await db.destinationCategory.create({ data: { name: input.name, slug, description: input.description, order: input.order ?? 0 } });
    await audit.record({ adminId: session.user.id, action: "created", entityType: domain, entityId: category.id, entityLabel: category.name });
    return category;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

export async function adminUpdateCategory(session: Session | null, domain: CategoryDomain, id: string, input: Partial<CategoryWriteInput>) {
  requireAdmin(session);
  if (input.name) {
    const nameExists =
      domain === "FESTIVAL_CATEGORY"
        ? await db.festivalCategory.findFirst({ where: { name: { equals: input.name, mode: "insensitive" }, id: { not: id } } })
        : await db.destinationCategory.findFirst({ where: { name: { equals: input.name, mode: "insensitive" }, id: { not: id } } });
    if (nameExists) throw new Error(`A category named "${input.name}" already exists.`);
  }

  try {
    const category =
      domain === "FESTIVAL_CATEGORY"
        ? await db.festivalCategory.update({ where: { id }, data: { name: input.name, description: input.description, order: input.order } })
        : await db.destinationCategory.update({ where: { id }, data: { name: input.name, description: input.description, order: input.order } });
    await audit.record({ adminId: session.user.id, action: "updated", entityType: domain, entityId: category.id, entityLabel: category.name });
    return category;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

/** Blocked at the DB level (required/optional FK) whenever content still uses this category — translated to a friendly message rather than a raw constraint error. */
export async function adminDeleteCategory(session: Session | null, domain: CategoryDomain, id: string) {
  requireAdmin(session);
  try {
    const category = domain === "FESTIVAL_CATEGORY" ? await db.festivalCategory.delete({ where: { id } }) : await db.destinationCategory.delete({ where: { id } });
    await audit.record({ adminId: session.user.id, action: "deleted", entityType: domain, entityId: id, entityLabel: category.name });
  } catch (error) {
    const friendly = friendlyDbError(error);
    if (friendly instanceof RelationshipInUseError) {
      throw new RelationshipInUseError("This category is still assigned to content — reassign or archive that content first.");
    }
    throw friendly;
  }
}

// ---------------------------------------------------------------------------
// Tags — one shared table across all four content types (spec §24)
// ---------------------------------------------------------------------------

export interface TagListFilters {
  search?: string;
  category?: TagCategory;
  includeArchived?: boolean;
}

export async function adminListTags(session: Session | null, filters: TagListFilters = {}) {
  requireAdmin(session);
  const tags = await db.tag.findMany({
    where: {
      category: filters.category,
      archived: filters.includeArchived ? undefined : false,
      name: filters.search ? { contains: filters.search, mode: "insensitive" } : undefined,
    },
    orderBy: { name: "asc" },
    include: { _count: { select: { festivals: true, destinations: true, experiences: true, foods: true } } },
  });
  return tags;
}

export interface TagWriteInput {
  name: string;
  category?: TagCategory;
}

/** Normalizes casing/spacing before the uniqueness check (spec §24: "do not allow accidental duplicate tags due to casing/spacing differences"). */
function normalizeTagName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export async function adminCreateTag(session: Session | null, input: TagWriteInput) {
  requireAdmin(session);
  const name = normalizeTagName(input.name);
  const existing = await db.tag.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  if (existing) throw new Error(`A tag named "${name}" already exists${existing.archived ? " (archived — unarchive it instead)" : ""}.`);

  const slug = await ensureUniqueSlug(slugify(name), async (candidate) => (await db.tag.count({ where: { slug: candidate } })) > 0);
  try {
    const tag = await db.tag.create({ data: { name, slug, category: input.category ?? "GENERAL" } });
    await audit.record({ adminId: session.user.id, action: "created", entityType: "TAG", entityId: tag.id, entityLabel: tag.name });
    return tag;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

export async function adminRenameTag(session: Session | null, id: string, name: string) {
  requireAdmin(session);
  const normalized = normalizeTagName(name);
  const existing = await db.tag.findFirst({ where: { name: { equals: normalized, mode: "insensitive" }, id: { not: id } } });
  if (existing) throw new Error(`A tag named "${normalized}" already exists.`);

  try {
    const tag = await db.tag.update({ where: { id }, data: { name: normalized } });
    await audit.record({ adminId: session.user.id, action: "renamed", entityType: "TAG", entityId: tag.id, entityLabel: tag.name });
    return tag;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

export async function adminSetTagArchived(session: Session | null, id: string, archived: boolean) {
  requireAdmin(session);
  try {
    const tag = await db.tag.update({ where: { id }, data: { archived } });
    await audit.record({ adminId: session.user.id, action: archived ? "archived" : "unarchived", entityType: "TAG", entityId: tag.id, entityLabel: tag.name });
    return tag;
  } catch (error) {
    throw friendlyDbError(error);
  }
}
