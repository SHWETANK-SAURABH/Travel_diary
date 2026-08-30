import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDestinationBySlug, getDestinationMedia, getNearbyToDestination } from "@/features/destinations/service";
import { formatMonthRange } from "@/features/destinations/seasonal";
import { trackDestinationView } from "@/features/analytics/service";
import { auth } from "@/lib/auth";
import { getPreference } from "@/features/users/service";
import { recommendNearby, preferenceToContext, hasPersonalizationSignal } from "@/features/recommendations";
import { Container } from "@/components/layout";
import { Badge, Disclosure, ResponsiveImage, Button, Gallery } from "@/components/ui";
import { SaveButton, VisitedButton, AddToTripButton, ShareButton, NearbyDiscovery } from "@/components/discovery";
import { RecommendationCard } from "@/components/recommendations";
import { BudgetBadge } from "@/components/destinations";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return {};

  const media = await getDestinationMedia(destination.id);
  const title = destination.name;
  const description = destination.description.slice(0, 155);

  return {
    title,
    description,
    alternates: { canonical: `/destinations/${destination.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/destinations/${destination.slug}`,
      type: "article",
      images: media[0] ? [{ url: media[0].url }] : undefined,
    },
  };
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();
  void trackDestinationView(destination.id);

  const [media, nearbyDestinations, session] = await Promise.all([
    getDestinationMedia(destination.id),
    getNearbyToDestination(destination),
    auth(),
  ]);

  // Context-aware "you're viewing this destination" recommendations (spec
  // §31) — authenticated visitors with real preferences see a personalized
  // upgrade of the plain nearby list; everyone else (including guests, whose
  // preferences live client-side only) sees the unchanged Phase 4/5 list.
  let personalizedNearby: Awaited<ReturnType<typeof recommendNearby>> | null = null;
  if (session) {
    const preference = await getPreference(session.user.id);
    const context = preferenceToContext(preference, { excludeId: destination.id });
    if (hasPersonalizationSignal(context)) {
      personalizedNearby = await recommendNearby(
        { kind: "destination", id: destination.id, latitude: destination.latitude, longitude: destination.longitude },
        context
      );
    }
  }

  const heroImage = media[0];
  const galleryImages = media.map((m) => ({ url: m.url, altText: m.altText }));
  const location = destination.location;
  const state = location.parent;

  const hasBestTime = destination.bestTimeStartMonth != null && destination.bestTimeEndMonth != null;
  const hasAltTime = destination.altTimeStartMonth != null && destination.altTimeEndMonth != null;

  // A simple, documented heuristic — not a real cost estimator (see
  // src/features/recommendations for where budget-aware ranking lives).
  const typicalTripLow = destination.approximateCostPerDay ? destination.approximateCostPerDay * 3 : null;
  const typicalTripHigh = destination.approximateCostPerDay ? destination.approximateCostPerDay * 5 : null;

  const mapHref =
    destination.latitude != null && destination.longitude != null
      ? `/map?lat=${destination.latitude}&lng=${destination.longitude}&zoom=11&month=${new Date().getMonth() + 1}`
      : "/map";

  const hasTransport = Boolean(location.nearestAirport || location.nearestRailwayStation || location.roadAccessNotes || location.localTransportNotes);
  const hasAccommodation = Boolean(location.accommodationNotes);

  return (
    <>
      <div className="relative">
        {heroImage ? (
          <ResponsiveImage src={heroImage.url} alt={heroImage.altText ?? destination.name} aspectRatio="21/9" priority containerClassName="max-h-112" />
        ) : (
          <div className="aspect-21/9 max-h-112 w-full bg-marigold-50" />
        )}
      </div>

      <Container className="py-8">
        <div className="flex flex-wrap items-center gap-2">
          {destination.category && <Badge variant="marigold">{destination.category.name}</Badge>}
          {destination.popularity === "HIDDEN" && <Badge variant="terracotta">hidden gem</Badge>}
        </div>

        <h1 className="mt-3 font-display text-display">{destination.name}</h1>
        <p className="mt-2 text-body text-ink-muted">
          {location.name}
          {state ? `, ${state.name}` : ""}
        </p>

        <p className="mt-6 max-w-2xl text-body leading-relaxed text-ink">{destination.description.slice(0, 320)}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <SaveButton kind="destination" id={destination.id} />
          <VisitedButton kind="destination" id={destination.id} />
          <AddToTripButton id={destination.id} />
          <ShareButton title={destination.name} id={destination.id} />
          <Link href={mapHref}>
            <Button variant="ghost">View on Map</Button>
          </Link>
        </div>

        {/* Quick travel snapshot */}
        <div className="mt-8 grid max-w-2xl grid-cols-2 gap-4 rounded-lg border border-border bg-paper-raised p-5 sm:grid-cols-4">
          <div>
            <p className="text-label text-ink-muted uppercase">Best time</p>
            <p className="mt-1 text-body text-ink">
              {hasBestTime ? formatMonthRange(destination.bestTimeStartMonth!, destination.bestTimeEndMonth!) : "Not set"}
            </p>
          </div>
          {hasAltTime && (
            <div>
              <p className="text-label text-ink-muted uppercase">Also good</p>
              <p className="mt-1 text-body text-ink">{formatMonthRange(destination.altTimeStartMonth!, destination.altTimeEndMonth!)}</p>
            </div>
          )}
          {destination.budgetLevel && (
            <div>
              <p className="text-label text-ink-muted uppercase">Budget</p>
              <p className="mt-1">
                <BudgetBadge level={destination.budgetLevel} />
              </p>
            </div>
          )}
          {typicalTripLow && typicalTripHigh && (
            <div>
              <p className="text-label text-ink-muted uppercase">Typical trip</p>
              <p className="mt-1 text-body text-ink">
                ₹{(typicalTripLow / 1000).toFixed(0)}K – ₹{(typicalTripHigh / 1000).toFixed(0)}K
              </p>
            </div>
          )}
        </div>

        {galleryImages.length > 1 && (
          <div className="mt-10">
            <h2 className="text-h2 font-display">Gallery</h2>
            <div className="mt-4">
              <Gallery images={galleryImages} contentName={destination.name} />
            </div>
          </div>
        )}

        <div className="mt-10 max-w-2xl">
          <Disclosure title="Overview" defaultOpen>
            <p className="leading-relaxed">{destination.description}</p>
          </Disclosure>

          {destination.bestTimeExplanation && (
            <Disclosure title="Best Time to Visit">
              <p>{destination.bestTimeExplanation}</p>
            </Disclosure>
          )}

          {destination.experiences.length > 0 && (
            <Disclosure title="Things to Do">
              <ul className="space-y-3">
                {destination.experiences.map((experience) => (
                  // No dedicated /experiences/[slug] page yet — shown as text, not a dead link.
                  <li key={experience.id}>
                    <p className="font-medium text-ink">{experience.name}</p>
                    <p className="text-caption text-ink-muted">{experience.description}</p>
                  </li>
                ))}
              </ul>
            </Disclosure>
          )}

          {destination.foods.length > 0 && (
            <Disclosure title="Food">
              <ul className="space-y-3">
                {destination.foods.map((food) => (
                  <li key={food.id}>
                    <p className="font-medium text-ink">{food.name}</p>
                    <p className="text-caption text-ink-muted">{food.description}</p>
                  </li>
                ))}
              </ul>
            </Disclosure>
          )}

          {destination.festivals.length > 0 && (
            <Disclosure title="Festivals" defaultOpen>
              <ul className="space-y-2">
                {destination.festivals.map((festival) => (
                  <li key={festival.id}>
                    <Link href={`/festivals/${festival.slug}`} className="font-medium text-ink hover:text-marigold-600">
                      {festival.name}
                    </Link>
                    <span className="ml-2 text-caption text-ink-muted">{festival.category.name}</span>
                  </li>
                ))}
              </ul>
            </Disclosure>
          )}

          {hasTransport && (
            <Disclosure title="How to Reach">
              <ul className="space-y-1">
                {location.nearestAirport && (
                  <li>
                    <strong className="font-medium">Nearest airport:</strong> {location.nearestAirport}
                  </li>
                )}
                {location.nearestRailwayStation && (
                  <li>
                    <strong className="font-medium">Nearest railway station:</strong> {location.nearestRailwayStation}
                  </li>
                )}
                {location.roadAccessNotes && <li>{location.roadAccessNotes}</li>}
                {location.localTransportNotes && <li>{location.localTransportNotes}</li>}
              </ul>
            </Disclosure>
          )}

          {hasAccommodation && (
            <Disclosure title="Where to Stay">
              <p>{location.accommodationNotes}</p>
            </Disclosure>
          )}

          {personalizedNearby && (personalizedNearby.destinations.length > 0 || personalizedNearby.festivals.length > 0) ? (
            <Disclosure title="Recommended Nearby" defaultOpen>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {personalizedNearby.destinations.map((rec) => (
                  <RecommendationCard
                    key={rec.item.id}
                    kind="destination"
                    id={rec.item.id}
                    slug={rec.item.slug}
                    name={rec.item.name}
                    locationName={rec.item.location.name}
                    imageUrl={rec.item.imageUrl}
                    matchPercent={rec.matchPercent}
                    reasons={rec.reasons}
                    context="destination_detail_nearby"
                  />
                ))}
                {personalizedNearby.festivals.map((rec) => (
                  <RecommendationCard
                    key={rec.item.id}
                    kind="festival"
                    id={rec.item.id}
                    slug={rec.item.slug}
                    name={rec.item.name}
                    locationName={rec.item.location.name}
                    imageUrl={rec.item.imageUrl}
                    matchPercent={rec.matchPercent}
                    reasons={rec.reasons}
                    context="destination_detail_nearby"
                  />
                ))}
              </div>
            </Disclosure>
          ) : (
            nearbyDestinations.length > 0 && (
              <Disclosure title="Nearby Places" defaultOpen>
                <NearbyDiscovery festivals={[]} destinations={nearbyDestinations} />
              </Disclosure>
            )
          )}
        </div>
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "TouristAttraction",
                name: destination.name,
                description: destination.description,
                geo:
                  destination.latitude != null && destination.longitude != null
                    ? { "@type": "GeoCoordinates", latitude: destination.latitude, longitude: destination.longitude }
                    : undefined,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Destinations", item: `${siteConfig.url}/destinations` },
                  { "@type": "ListItem", position: 2, name: destination.name, item: `${siteConfig.url}/destinations/${destination.slug}` },
                ],
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
