/** Same normalization `prisma/seed.ts` used privately — generalized here so admin write paths and the seed script share one implementation. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Seed data gets hand-picked, already-unique slugs; admin-created content
 * can't assume that. Appends `-2`, `-3`, ... until `exists()` reports free.
 * `excludeId` lets an edit-in-place check "unique among every OTHER row."
 */
export async function ensureUniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  const root = slugify(base) || "item";
  let candidate = root;
  let suffix = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
