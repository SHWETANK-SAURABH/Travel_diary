import type { ContentType } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Resolves the polymorphic Media rows for one piece of content. This is the
 * one place that should ever query Media by (contentType, contentId) — see
 * the trade-off note on the Media model in schema.prisma.
 */
export async function mediaFor(contentType: ContentType, contentId: string) {
  return db.media.findMany({
    where: { contentType, contentId },
    orderBy: { order: "asc" },
  });
}

/** Batched variant for list views, to avoid an N+1 query per card. */
export async function mediaForMany(contentType: ContentType, contentIds: string[]) {
  if (contentIds.length === 0) return new Map<string, Awaited<ReturnType<typeof mediaFor>>>();

  const rows = await db.media.findMany({
    where: { contentType, contentId: { in: contentIds } },
    orderBy: { order: "asc" },
  });

  const byContentId = new Map<string, typeof rows>();
  for (const row of rows) {
    const bucket = byContentId.get(row.contentId) ?? [];
    bucket.push(row);
    byContentId.set(row.contentId, bucket);
  }
  return byContentId;
}
