import Link from "next/link";
import type { Metadata } from "next";
import { getDestinationDiscoveryFeed, listDestinationCategories } from "@/features/destinations/service";
import { isInSeason } from "@/features/destinations/seasonal";
import { trackPageView } from "@/features/analytics/service";
import { Container } from "@/components/layout";
import { EmptyState, MonthFilterLinks, FilterPillLinks, Badge, Button } from "@/components/ui";
import { DestinationCard } from "@/components/destinations";
import type { ContentPopularity } from "@prisma/client";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Browse India's destinations — famous and hidden, by budget, by state, and by season.",
};

interface PageProps {
  searchParams: Promise<{ state?: string; month?: string; category?: string; popularity?: string }>;
}

const POPULARITY_OPTIONS = [
  { label: "Popular", value: "POPULAR" },
  { label: "Hidden", value: "HIDDEN" },
  { label: "Local / Emerging", value: "LOCAL_EMERGING" },
];

export default async function DestinationsPage({ searchParams }: PageProps) {
  const { state, month: monthParam, category, popularity } = await searchParams;
  const month = monthParam ? Number(monthParam) : null;

  const [feed, categories] = await Promise.all([
    getDestinationDiscoveryFeed({
      stateSlug: state,
      month,
      categorySlug: category,
      popularity: popularity as ContentPopularity | undefined,
    }),
    listDestinationCategories(),
  ]);
  void trackPageView("/destinations");

  const baseParams = { state, category, popularity };

  const filtered = month ? feed.filter((d) => isInSeason(d, month)) : feed;

  const featured = filtered.filter((d) => d.featured);
  const bestThisMonth = filtered.filter((d) => !d.featured && isInSeason(d));
  const hidden = filtered.filter((d) => !d.featured && !bestThisMonth.includes(d) && d.popularity === "HIDDEN");
  const shown = new Set([...featured, ...bestThisMonth, ...hidden].map((d) => d.id));
  const rest = filtered.filter((d) => !shown.has(d.id));

  return (
    <Container className="py-12">
      <h1 className="text-h1 font-display">Destinations</h1>
      <p className="mt-2 text-body text-ink-muted">
        {feed.length} destination{feed.length === 1 ? "" : "s"} across India.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <MonthFilterLinks basePath="/destinations" label="Browse destinations by month" activeMonth={month} baseParams={baseParams} />
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <FilterPillLinks
            basePath="/destinations"
            label="Type"
            options={categories.map((c) => ({ label: c.name, value: c.slug }))}
            activeValue={category}
            paramName="category"
            baseParams={{ state, month: monthParam, popularity }}
          />
          <FilterPillLinks
            basePath="/destinations"
            label="Classification"
            options={POPULARITY_OPTIONS}
            activeValue={popularity}
            paramName="popularity"
            baseParams={{ state, month: monthParam, category }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-12"
          title="No destinations match these filters"
          description="Try a different month, type, or classification."
        />
      ) : (
        <div className="mt-10 flex flex-col gap-12">
          {featured.length > 0 && <DestinationSection title="Featured Destinations" destinations={featured} />}
          {bestThisMonth.length > 0 && <DestinationSection title="Best This Month" destinations={bestThisMonth} />}
          {hidden.length > 0 && (
            <div>
              <DestinationSection title="Hidden Gems" destinations={hidden} />
              <Link href="/hidden-india" className="mt-3 inline-block">
                <Button variant="text">Explore all of Hidden India →</Button>
              </Link>
            </div>
          )}
          {rest.length > 0 && (
            <DestinationSection title={featured.length + bestThisMonth.length + hidden.length > 0 ? "More Destinations" : "Popular Destinations"} destinations={rest} />
          )}
        </div>
      )}
    </Container>
  );
}

function DestinationSection({ title, destinations }: { title: string; destinations: Awaited<ReturnType<typeof getDestinationDiscoveryFeed>> }) {
  return (
    <section>
      <div className="flex items-center gap-2">
        <h2 className="text-h2 font-display">{title}</h2>
        {title === "Hidden Gems" && <Badge variant="terracotta">Offbeat</Badge>}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((destination) => (
          <DestinationCard key={destination.id} destination={destination} />
        ))}
      </div>
    </section>
  );
}
