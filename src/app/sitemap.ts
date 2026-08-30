import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteConfig } from "@/config/site";

const STATIC_ROUTES = ["", "/explore", "/map", "/festivals", "/destinations", "/hidden-india", "/calendar"];

// Without this, Next would statically freeze the sitemap at build time —
// newly published festivals/destinations wouldn't appear until the next
// deploy. Hourly is fresh enough for a sitemap (crawlers don't need
// per-request freshness) without hitting the DB on every crawl.
export const revalidate = 3600;

/**
 * Only real, published content entities become indexable URLs here — no
 * generated/fake pages, per the SEO foundation requirement.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [festivals, destinations] = await Promise.all([
    db.festival.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.destination.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    ...STATIC_ROUTES.map((path) => ({ url: `${siteConfig.url}${path}`, lastModified: new Date() })),
    ...festivals.map((f) => ({ url: `${siteConfig.url}/festivals/${f.slug}`, lastModified: f.updatedAt })),
    ...destinations.map((d) => ({ url: `${siteConfig.url}/destinations/${d.slug}`, lastModified: d.updatedAt })),
  ];
}
