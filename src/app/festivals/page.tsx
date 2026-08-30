import type { Metadata } from "next";
import { getFestivalDiscoveryFeed, listFestivalCategories } from "@/features/festivals/service";
import { trackPageView } from "@/features/analytics/service";
import { Container } from "@/components/layout";
import { EmptyState, MonthFilterLinks, FilterPillLinks } from "@/components/ui";
import { FestivalCard } from "@/components/festivals";
import type { ContentPopularity } from "@prisma/client";

export const metadata: Metadata = {
  title: "Festivals",
  description: "Browse India's festivals — regional, harvest, food, arts and modern celebrations.",
};

interface PageProps {
  searchParams: Promise<{ state?: string; month?: string; category?: string; popularity?: string }>;
}

const POPULARITY_OPTIONS = [
  { label: "Popular", value: "POPULAR" },
  { label: "Hidden", value: "HIDDEN" },
  { label: "Local / Emerging", value: "LOCAL_EMERGING" },
];

export default async function FestivalsPage({ searchParams }: PageProps) {
  const { state, month: monthParam, category, popularity } = await searchParams;
  const month = monthParam ? Number(monthParam) : null;

  const [feed, categories] = await Promise.all([
    getFestivalDiscoveryFeed({
      stateSlug: state,
      month,
      categorySlug: category,
      popularity: popularity as ContentPopularity | undefined,
    }),
    listFestivalCategories(),
  ]);
  void trackPageView("/festivals");

  const baseParams = { state, category, popularity };

  const monthFiltered = month ? feed.filter((f) => f.occurrence?.startDate?.getUTCMonth() === month - 1) : feed;
  const happeningNow = monthFiltered.filter((f) => f.status === "HAPPENING_NOW");
  const upcoming = monthFiltered.filter((f) => f.status === "UPCOMING");
  const rest = monthFiltered.filter((f) => f.status !== "HAPPENING_NOW" && f.status !== "UPCOMING");

  return (
    <Container className="py-12">
      <h1 className="text-h1 font-display">Festivals</h1>
      <p className="mt-2 text-body text-ink-muted">
        {feed.length} festival{feed.length === 1 ? "" : "s"} across India&rsquo;s festival calendar.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <MonthFilterLinks basePath="/festivals" label="Browse festivals by month" activeMonth={month} baseParams={baseParams} />
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <FilterPillLinks
            basePath="/festivals"
            label="Category"
            options={categories.map((c) => ({ label: c.name, value: c.slug }))}
            activeValue={category}
            paramName="category"
            baseParams={{ state, month: monthParam, popularity }}
          />
          <FilterPillLinks
            basePath="/festivals"
            label="Classification"
            options={POPULARITY_OPTIONS}
            activeValue={popularity}
            paramName="popularity"
            baseParams={{ state, month: monthParam, category }}
          />
        </div>
      </div>

      {monthFiltered.length === 0 ? (
        <EmptyState
          className="mt-12"
          title="No festivals match these filters"
          description="Try a different month, category, or classification."
        />
      ) : (
        <div className="mt-10 flex flex-col gap-12">
          {happeningNow.length > 0 && (
            <FestivalSection title="Happening Now" festivals={happeningNow} />
          )}
          {upcoming.length > 0 && <FestivalSection title="Upcoming" festivals={upcoming} />}
          {rest.length > 0 && (
            <FestivalSection title={month ? "This Month" : "More Festivals"} festivals={rest} />
          )}
        </div>
      )}
    </Container>
  );
}

function FestivalSection({ title, festivals }: { title: string; festivals: Awaited<ReturnType<typeof getFestivalDiscoveryFeed>> }) {
  return (
    <section>
      <h2 className="text-h2 font-display">{title}</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {festivals.map((festival) => (
          <FestivalCard key={festival.id} festival={festival} />
        ))}
      </div>
    </section>
  );
}
