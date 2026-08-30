import type { Metadata } from "next";
import { getFestivalDiscoveryFeed, getHappeningNowFestivals } from "@/features/festivals/service";
import { getDestinationDiscoveryFeed } from "@/features/destinations/service";
import { trackPageView } from "@/features/analytics/service";
import { Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { FestivalCard } from "@/components/festivals";
import { DestinationCard } from "@/components/destinations";
import { TrackedLink, TrackedCardWrapper } from "@/components/discovery";
import { calendarHref, mapHref, festivalsHref, destinationsHref, monthName } from "@/features/discovery/context";

export const metadata: Metadata = {
  title: "Explore",
  description: "Discover India's festivals, destinations, hidden gems, food and experiences — by month, by state, or on the living map.",
};

// No dynamic API of its own — same reasoning as /hidden-india: without this,
// Next would statically freeze this page's live DB-backed sections.
export const dynamic = "force-dynamic";

const CURRENT_MONTH = new Date().getMonth() + 1;

export default async function ExplorePage() {
  const [happeningNow, monthFestivals, monthDestinations, hiddenFestivals, hiddenDestinations] = await Promise.all([
    getHappeningNowFestivals(3),
    getFestivalDiscoveryFeed({ month: CURRENT_MONTH }),
    getDestinationDiscoveryFeed({ month: CURRENT_MONTH }),
    getFestivalDiscoveryFeed({ popularity: "HIDDEN" }),
    getDestinationDiscoveryFeed({ popularity: "HIDDEN" }),
  ]);
  void trackPageView("/explore");

  const thisMonthFestivals = monthFestivals.filter((f) => f.occurrence?.startDate?.getUTCMonth() === CURRENT_MONTH - 1).slice(0, 3);
  const bestPlacesThisMonth = monthDestinations.slice(0, 4);
  const hiddenPicks = [...hiddenDestinations.slice(0, 2), ...hiddenFestivals.slice(0, 2)];

  return (
    <>
      <div className="border-b border-border bg-ink py-20 text-paper">
        <Container>
          <p className="text-label font-medium tracking-wide text-marigold-400 uppercase">Discover India</p>
          <h1 className="mt-3 max-w-2xl font-display text-display">
            Where, when, and what to experience — across festivals, destinations and the road between them.
          </h1>
          <p className="mt-3 max-w-xl text-body text-paper/80">
            Start with what&rsquo;s happening now, browse a month, or drop straight onto the map.
          </p>
        </Container>
      </div>

      <Container className="py-12">
        <div className="flex flex-col gap-14">
          {happeningNow.length > 0 && (
            <section>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-h2 font-display">Happening Now</h2>
                <TrackedLink
                  href={calendarHref()}
                  event={{ type: "EXPLORE_INTERACTION", metadata: { action: "calendar_cta" } }}
                  className="text-caption text-marigold-600 hover:underline"
                >
                  Full calendar →
                </TrackedLink>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {happeningNow.map((festival) => (
                  <TrackedCardWrapper
                    key={festival.id}
                    event={{ type: "EXPLORE_INTERACTION", contentType: "FESTIVAL", contentId: festival.id, metadata: { action: "discovery_clicked", section: "happening_now" } }}
                  >
                    <FestivalCard festival={festival} />
                  </TrackedCardWrapper>
                ))}
              </div>
            </section>
          )}

          {thisMonthFestivals.length > 0 && (
            <section>
              <h2 className="text-h2 font-display">{monthName(CURRENT_MONTH)} in India</h2>
              <p className="mt-1 text-body text-ink-muted">Festivals worth timing your trip around this month.</p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {thisMonthFestivals.map((festival) => (
                  <TrackedCardWrapper
                    key={festival.id}
                    event={{ type: "EXPLORE_INTERACTION", contentType: "FESTIVAL", contentId: festival.id, metadata: { action: "discovery_clicked", section: "this_month" } }}
                  >
                    <FestivalCard festival={festival} />
                  </TrackedCardWrapper>
                ))}
              </div>
            </section>
          )}

          {bestPlacesThisMonth.length > 0 && (
            <section>
              <h2 className="text-h2 font-display">Best Places to Visit This Month</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {bestPlacesThisMonth.map((destination) => (
                  <TrackedCardWrapper
                    key={destination.id}
                    event={{ type: "EXPLORE_INTERACTION", contentType: "DESTINATION", contentId: destination.id, metadata: { action: "discovery_clicked", section: "best_this_month" } }}
                  >
                    <DestinationCard destination={destination} />
                  </TrackedCardWrapper>
                ))}
              </div>
            </section>
          )}

          {hiddenPicks.length > 0 && (
            <section className="rounded-lg border border-border bg-marigold-50/50 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-h2 font-display">Hidden India</h2>
                  <p className="mt-1 text-body text-ink-muted">Local and emerging finds, off the well-worn path.</p>
                </div>
                <TrackedLink href="/hidden-india" event={{ type: "EXPLORE_INTERACTION", metadata: { action: "discovery_clicked", section: "hidden_india_cta" } }}>
                  <Button variant="outline">Explore Hidden India →</Button>
                </TrackedLink>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {hiddenDestinations.slice(0, 2).map((destination) => (
                  <TrackedCardWrapper
                    key={destination.id}
                    event={{ type: "EXPLORE_INTERACTION", contentType: "DESTINATION", contentId: destination.id, metadata: { action: "discovery_clicked", section: "hidden_india" } }}
                  >
                    <DestinationCard destination={destination} />
                  </TrackedCardWrapper>
                ))}
                {hiddenFestivals.slice(0, 2).map((festival) => (
                  <TrackedCardWrapper
                    key={festival.id}
                    event={{ type: "EXPLORE_INTERACTION", contentType: "FESTIVAL", contentId: festival.id, metadata: { action: "discovery_clicked", section: "hidden_india" } }}
                  >
                    <FestivalCard festival={festival} />
                  </TrackedCardWrapper>
                ))}
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TrackedLink
              href={mapHref()}
              event={{ type: "EXPLORE_INTERACTION", metadata: { action: "map_cta" } }}
              className="group rounded-lg border border-border p-6 transition-shadow duration-base hover:shadow-panel"
            >
              <p className="text-h3 font-display">Explore the Map</p>
              <p className="mt-1 text-caption text-ink-muted">India&rsquo;s festivals and destinations, plotted geographically.</p>
            </TrackedLink>
            <TrackedLink
              href={festivalsHref()}
              event={{ type: "EXPLORE_INTERACTION", metadata: { action: "festival_cta" } }}
              className="group rounded-lg border border-border p-6 transition-shadow duration-base hover:shadow-panel"
            >
              <p className="text-h3 font-display">Browse Festivals</p>
              <p className="mt-1 text-caption text-ink-muted">Every festival, filterable by month, category and state.</p>
            </TrackedLink>
            <TrackedLink
              href={destinationsHref()}
              event={{ type: "EXPLORE_INTERACTION", metadata: { action: "destination_cta" } }}
              className="group rounded-lg border border-border p-6 transition-shadow duration-base hover:shadow-panel"
            >
              <p className="text-h3 font-display">Browse Destinations</p>
              <p className="mt-1 text-caption text-ink-muted">Famous and hidden, by budget, state and season.</p>
            </TrackedLink>
          </section>
        </div>
      </Container>
    </>
  );
}
