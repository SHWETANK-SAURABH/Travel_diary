import type { Metadata } from "next";
import { getFestivalDiscoveryFeed } from "@/features/festivals/service";
import { getDestinationDiscoveryFeed } from "@/features/destinations/service";
import { trackPageView } from "@/features/analytics/service";
import { Container } from "@/components/layout";
import { EmptyState } from "@/components/ui";
import { FestivalCard } from "@/components/festivals";
import { DestinationCard } from "@/components/destinations";

export const metadata: Metadata = {
  title: "Hidden India",
  description: "Local and emerging festivals and offbeat destinations, off the well-worn path.",
};

// Without any dynamic API (no searchParams, unlike /festivals and
// /destinations), Next would otherwise statically prerender this at build
// time and freeze its content — wrong for a page listing live DB content
// that a future CMS can add to at any time.
export const dynamic = "force-dynamic";

export default async function HiddenIndiaPage() {
  const [hiddenFestivals, hiddenDestinations] = await Promise.all([
    getFestivalDiscoveryFeed({ popularity: "HIDDEN" }),
    getDestinationDiscoveryFeed({ popularity: "HIDDEN" }),
  ]);
  void trackPageView("/hidden-india");

  const isEmpty = hiddenFestivals.length === 0 && hiddenDestinations.length === 0;

  return (
    <>
      {/* A moodier, more exploratory band than the rest of the site — still built from the same design tokens, not a second theme. */}
      <div className="border-b border-border bg-ink py-16 text-paper">
        <Container>
          <p className="text-label font-medium tracking-wide text-marigold-400 uppercase">Off the well-worn path</p>
          <h1 className="mt-3 font-display text-display">Hidden India</h1>
          <p className="mt-3 max-w-xl text-body text-paper/80">
            Festivals and destinations that haven&rsquo;t made it onto every itinerary yet — local,
            emerging, and worth the detour.
          </p>
        </Container>
      </div>

      <Container className="py-12">
        {isEmpty ? (
          <EmptyState
            title="Nothing marked hidden yet"
            description="This page fills in as more local and emerging content is added."
          />
        ) : (
          <div className="flex flex-col gap-12">
            {hiddenDestinations.length > 0 && (
              <section>
                <h2 className="text-h2 font-display">Hidden Destinations</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {hiddenDestinations.map((destination) => (
                    <DestinationCard key={destination.id} destination={destination} />
                  ))}
                </div>
              </section>
            )}

            {hiddenFestivals.length > 0 && (
              <section>
                <h2 className="text-h2 font-display">Hidden Festivals</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {hiddenFestivals.map((festival) => (
                    <FestivalCard key={festival.id} festival={festival} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
