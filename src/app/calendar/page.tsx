import type { Metadata } from "next";
import { getFestivalDiscoveryFeed, getHappeningNowFestivals, getUpcomingFestivals } from "@/features/festivals/service";
import { getDestinationDiscoveryFeed } from "@/features/destinations/service";
import { trackPageView } from "@/features/analytics/service";
import { Container } from "@/components/layout";
import { EmptyState, MonthFilterLinks, Button } from "@/components/ui";
import { FestivalCard } from "@/components/festivals";
import { DestinationCard } from "@/components/destinations";
import { TrackedLink, TrackedCardWrapper } from "@/components/discovery";
import { mapHref, monthName } from "@/features/discovery/context";

export const metadata: Metadata = {
  title: "Festival Calendar",
  description: "What's happening across India, month by month — festivals, celebrations and the best time to catch them.",
};

const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const { month: monthParam } = await searchParams;
  const selectedMonth = monthParam ? Number(monthParam) : null;

  const [happeningNow, upcoming, monthFeed, monthDestinations] = await Promise.all([
    getHappeningNowFestivals(6),
    getUpcomingFestivals(6),
    selectedMonth ? getFestivalDiscoveryFeed({ month: selectedMonth }) : Promise.resolve([]),
    selectedMonth ? getDestinationDiscoveryFeed({ month: selectedMonth }) : Promise.resolve([]),
  ]);
  void trackPageView("/calendar");

  // Same "does this occurrence actually fall in the selected month" filter /festivals uses.
  const monthFestivals = selectedMonth ? monthFeed.filter((f) => f.occurrence?.startDate?.getUTCMonth() === selectedMonth - 1) : [];
  const bestDestinationsThisMonth = monthDestinations.slice(0, 4);

  return (
    <>
      <div className="border-b border-border bg-marigold-50 py-16">
        <Container>
          <p className="text-label font-medium tracking-wide text-marigold-700 uppercase">
            {monthName(CURRENT_MONTH)} {CURRENT_YEAR}
          </p>
          <h1 className="mt-3 font-display text-display">Festival Calendar</h1>
          <p className="mt-3 max-w-xl text-body text-ink-muted">
            What&rsquo;s happening across India this year — see what&rsquo;s on right now, or browse any month.
          </p>
        </Container>
      </div>

      <Container className="py-12">
        <MonthFilterLinks basePath="/calendar" label="Browse festivals by month" activeMonth={selectedMonth} />

        {selectedMonth ? (
          <div className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-h2 font-display">{monthName(selectedMonth)}</h2>
              <TrackedLink
                href={mapHref({ month: selectedMonth })}
                event={{ type: "CALENDAR_INTERACTION", metadata: { action: "map_cta_clicked", month: selectedMonth } }}
              >
                <Button variant="outline">Explore {monthName(selectedMonth)} on Map →</Button>
              </TrackedLink>
            </div>

            {monthFestivals.length === 0 ? (
              <EmptyState
                className="mt-8"
                title={`No festivals confirmed for ${monthName(selectedMonth)} yet`}
                description="Check back as more dates are verified, or browse another month."
              />
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {monthFestivals.map((festival) => (
                  <TrackedCardWrapper
                    key={festival.id}
                    event={{ type: "CALENDAR_INTERACTION", contentType: "FESTIVAL", contentId: festival.id, metadata: { action: "festival_clicked", month: selectedMonth } }}
                  >
                    <FestivalCard festival={festival} />
                  </TrackedCardWrapper>
                ))}
              </div>
            )}

            {bestDestinationsThisMonth.length > 0 && (
              <div className="mt-12">
                <h3 className="text-h3 font-display">Best Places to Visit in {monthName(selectedMonth)}</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {bestDestinationsThisMonth.map((destination) => (
                    <DestinationCard key={destination.id} destination={destination} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-10 flex flex-col gap-12">
            {happeningNow.length > 0 && (
              <section>
                <h2 className="text-h2 font-display">Happening Now</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {happeningNow.map((festival) => (
                    <TrackedCardWrapper
                      key={festival.id}
                      event={{ type: "CALENDAR_INTERACTION", contentType: "FESTIVAL", contentId: festival.id, metadata: { action: "festival_clicked" } }}
                    >
                      <FestivalCard festival={festival} />
                    </TrackedCardWrapper>
                  ))}
                </div>
              </section>
            )}

            {upcoming.length > 0 && (
              <section>
                <h2 className="text-h2 font-display">Upcoming</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((festival) => (
                    <TrackedCardWrapper
                      key={festival.id}
                      event={{ type: "CALENDAR_INTERACTION", contentType: "FESTIVAL", contentId: festival.id, metadata: { action: "festival_clicked" } }}
                    >
                      <FestivalCard festival={festival} />
                    </TrackedCardWrapper>
                  ))}
                </div>
              </section>
            )}

            {happeningNow.length === 0 && upcoming.length === 0 && (
              <EmptyState
                title="Nothing scheduled right now"
                description="Browse by month above to see festivals throughout the year."
              />
            )}
          </div>
        )}
      </Container>
    </>
  );
}
