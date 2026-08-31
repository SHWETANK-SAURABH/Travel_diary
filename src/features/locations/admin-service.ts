import { db } from "@/lib/db";
import type { Session } from "next-auth";
import type { LocationType, LocationPrecision } from "@prisma/client";
import { requireAdmin, friendlyDbError, RelationshipInUseError } from "@/features/admin/service";
import { audit } from "@/lib/audit";
import { ensureUniqueSlug } from "@/lib/slug";

export interface AdminLocationListFilters {
  search?: string;
  type?: LocationType;
  page?: number;
}

export async function adminListLocations(session: Session | null, filters: AdminLocationListFilters = {}) {
  requireAdmin(session);
  const page = filters.page ?? 1;
  const pageSize = 40;
  const where = {
    type: filters.type,
    name: filters.search ? { contains: filters.search, mode: "insensitive" as const } : undefined,
  };

  const [items, total] = await Promise.all([
    db.location.findMany({
      where,
      select: { id: true, slug: true, name: true, type: true, precision: true, parent: { select: { name: true } }, _count: { select: { children: true } } },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.location.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function adminGetLocation(session: Session | null, id: string) {
  requireAdmin(session);
  return db.location.findUnique({ where: { id }, include: { parent: true, children: { select: { id: true, name: true, type: true } } } });
}

/** Options for a parent-location picker — every non-CITY location can be a parent (spec §18's hierarchy). */
export async function adminListLocationOptions(session: Session | null) {
  requireAdmin(session);
  return db.location.findMany({ select: { id: true, name: true, type: true, slug: true }, orderBy: [{ type: "asc" }, { name: "asc" }] });
}

export interface LocationWriteInput {
  type: LocationType;
  name: string;
  slug?: string;
  parentId?: string;
  latitude?: number;
  longitude?: number;
  precision?: LocationPrecision;
  nearestAirport?: string;
  nearestRailwayStation?: string;
  roadAccessNotes?: string;
  localTransportNotes?: string;
  accommodationNotes?: string;
}

/** Walks the ancestor chain of `candidateParentId` — throws if `nodeId` appears in it (spec §18: "do not allow arbitrary hierarchy corruption"). Skipped on create, since a brand-new node has no descendants yet. */
async function assertNoCycle(nodeId: string, candidateParentId: string) {
  let current: string | null = candidateParentId;
  const seen = new Set<string>();
  while (current) {
    if (current === nodeId) throw new Error("A location can't be its own ancestor.");
    if (seen.has(current)) break; // defensive — an existing cycle shouldn't infinite-loop this check
    seen.add(current);
    const parent: { parentId: string | null } | null = await db.location.findUnique({ where: { id: current }, select: { parentId: true } });
    current = parent?.parentId ?? null;
  }
}

export async function adminCreateLocation(session: Session | null, input: LocationWriteInput) {
  requireAdmin(session);
  const slug = await ensureUniqueSlug(input.slug || input.name, async (candidate) => (await db.location.count({ where: { slug: candidate } })) > 0);

  try {
    const location = await db.location.create({
      data: {
        type: input.type,
        name: input.name,
        slug,
        parentId: input.parentId,
        latitude: input.latitude,
        longitude: input.longitude,
        precision: input.precision,
        nearestAirport: input.nearestAirport,
        nearestRailwayStation: input.nearestRailwayStation,
        roadAccessNotes: input.roadAccessNotes,
        localTransportNotes: input.localTransportNotes,
        accommodationNotes: input.accommodationNotes,
      },
    });
    await audit.record({ adminId: session.user.id, action: "created", entityType: "LOCATION", entityId: location.id, entityLabel: location.name });
    return location;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

export async function adminUpdateLocation(session: Session | null, id: string, input: Partial<LocationWriteInput>) {
  requireAdmin(session);
  const existing = await db.location.findUnique({ where: { id }, select: { name: true, slug: true } });
  if (!existing) throw new Error("Location not found");

  if (input.parentId) await assertNoCycle(id, input.parentId);

  const slug = input.slug || input.name ? await ensureUniqueSlug(input.slug || input.name || existing.name, async (candidate) => candidate !== existing.slug && (await db.location.count({ where: { slug: candidate } })) > 0) : undefined;

  try {
    const location = await db.location.update({
      where: { id },
      data: {
        type: input.type,
        name: input.name,
        slug,
        parentId: input.parentId,
        latitude: input.latitude,
        longitude: input.longitude,
        precision: input.precision,
        nearestAirport: input.nearestAirport,
        nearestRailwayStation: input.nearestRailwayStation,
        roadAccessNotes: input.roadAccessNotes,
        localTransportNotes: input.localTransportNotes,
        accommodationNotes: input.accommodationNotes,
      },
    });
    await audit.record({ adminId: session.user.id, action: "updated", entityType: "LOCATION", entityId: location.id, entityLabel: location.name });
    return location;
  } catch (error) {
    throw friendlyDbError(error);
  }
}

/** Deletion is real (no draft/publish state on Location — spec doesn't ask for one), but only ever succeeds when nothing depends on this row: the schema's own `onDelete: Restrict` (children) plus every content model's required/optional FK to Location will throw P2003 otherwise, translated to a friendly message. */
export async function adminDeleteLocation(session: Session | null, id: string) {
  requireAdmin(session);
  const existing = await db.location.findUnique({ where: { id }, select: { name: true } });
  if (!existing) throw new Error("Location not found");

  try {
    await db.location.delete({ where: { id } });
  } catch (error) {
    const friendly = friendlyDbError(error);
    if (friendly instanceof RelationshipInUseError) {
      throw new RelationshipInUseError("This location still has sub-locations or content pointing at it — move or remove those first.");
    }
    throw friendly;
  }
  await audit.record({ adminId: session.user.id, action: "deleted", entityType: "LOCATION", entityId: id, entityLabel: existing.name });
}
