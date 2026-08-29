import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getFestivalBySlug,
  getFestivalMedia,
  getNearbyToFestival,
  pickRelevantOccurrence,
} from "@/features/festivals/service";
import { resolveFestivalStatus } from "@/features/festivals/status";
import { trackFestivalView } from "@/features/analytics/service";
import { Container } from "@/components/layout";
import { Badge, Disclosure, ResponsiveImage, Button } from "@/components/ui";
import { SaveButton, VisitedButton, AddToTripButton, ShareButton } from "@/components/discovery";
import { FestivalStatusBadge, Countdown, FestivalGallery, NearbyDiscovery } from "@/components/festivals";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const festival = await getFestivalBySlug(slug);
  if (!festival) return {};

  const media = await getFestivalMedia(festival.id);
  const title = festival.name;
  const description = festival.description.slice(0, 155);

  return {
    title,
    description,
    alternates: { canonical: `/festivals/${festival.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/festivals/${festival.slug}`,
      type: "article",
      images: media[0] ? [{ url: media[0].url }] : undefined,
    },
  };
}

export default async function FestivalDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const festival = await getFestivalBySlug(slug);
  if (!festival) notFound();
  void trackFestivalView(festival.id);

  const [media, nearby] = await Promise.all([
    getFestivalMedia(festival.id),
    getNearbyToFestival(festival),
  ]);

  const occurrence = pickRelevantOccurrence(festival.occurrences);
  const status = resolveFestivalStatus(occurrence);
  const heroImage = media[0];
  const galleryImages = media.map((m) => ({ url: m.url, altText: m.altText }));

  const durationDays =
    occurrence?.startDate && occurrence.endDate
      ? Math.round((occurrence.endDate.getTime() - occurrence.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : festival.typicalDurationDays;

  const location = festival.location;
  const state = location.parent;

  const currentMonth = new Date().getMonth() + 1;
  const mapHref =
    festival.latitude != null && festival.longitude != null
      ? `/map?lat=${festival.latitude}&lng=${festival.longitude}&zoom=11&month=${occurrence?.startDate ? occurrence.startDate.getUTCMonth() + 1 : currentMonth}`
      : "/map";

  const hasTransport = Boolean(location.nearestAirport || location.nearestRailwayStation || location.roadAccessNotes || location.localTransportNotes);
  const hasAccommodation = Boolean(location.accommodationNotes);

  // Curated host-destination connections first, then geographically-nearby ones, deduped.
  const nearbyDestinations = [
    ...festival.destinations,
    ...nearby.destinations.filter((d) => !festival.destinations.some((fd) => fd.id === d.id)),
  ];
  const nearbyFestivals = nearby.festivals;

  return (
    <>
      {/* Hero */}
      <div className="relative">
        {heroImage ? (
          <ResponsiveImage src={heroImage.url} alt={heroImage.altText ?? festival.name} aspectRatio="21/9" priority containerClassName="max-h-112" />
        ) : (
          <div className="aspect-21/9 max-h-112 w-full bg-marigold-50" />
        )}
      </div>

      <Container className="py-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="marigold">{festival.category.name}</Badge>
          {festival.popularity !== "POPULAR" && (
            <Badge variant="terracotta">{festival.popularity.replace("_", " ").toLowerCase()}</Badge>
          )}
          <FestivalStatusBadge status={status} />
        </div>

        <h1 className="mt-3 font-display text-display">{festival.name}</h1>
        <p className="mt-2 text-body text-ink-muted">
          {location.name}
          {state ? `, ${state.name}` : ""}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {occurrence?.startDate ? (
            <p className="text-body text-ink">
              {occurrence.startDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
              {occurrence.endDate && occurrence.endDate.getTime() !== occurrence.startDate.getTime()
                ? ` – ${occurrence.endDate.toLocaleDateString("en-IN", { month: "long", day: "numeric" })}`
                : ""}
            </p>
          ) : (
            <p className="text-body text-ink-muted">Date not yet announced</p>
          )}
          {durationDays && <span className="text-caption text-ink-muted">{durationDays} days</span>}
        </div>

        {status === "UPCOMING" && occurrence?.startDate && <Countdown date={occurrence.startDate} />}

        {festival.travellerFitTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {festival.travellerFitTags.map((tag) => (
              <Badge key={tag.id} variant="neutral">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <p className="mt-6 max-w-2xl text-body leading-relaxed text-ink">{festival.description.slice(0, 320)}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <SaveButton kind="festival" id={festival.id} />
          <VisitedButton kind="festival" id={festival.id} />
          <AddToTripButton id={festival.id} />
          <ShareButton title={festival.name} id={festival.id} />
          <Link href={mapHref}>
            <Button variant="ghost">View on Map</Button>
          </Link>
        </div>

        {galleryImages.length > 1 && (
          <div className="mt-10">
            <h2 className="text-h2 font-display">Gallery</h2>
            <div className="mt-4">
              <FestivalGallery images={galleryImages} festivalName={festival.name} />
            </div>
          </div>
        )}

        {/* Progressive disclosure */}
        <div className="mt-10 max-w-2xl">
          <Disclosure title="Festival Story" defaultOpen>
            <p className="leading-relaxed">{festival.description}</p>
            {festival.recurrenceNotes && <p className="mt-3 text-caption text-ink-muted">{festival.recurrenceNotes}</p>}
          </Disclosure>

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

          {festival.foods.length > 0 && (
            <Disclosure title="Food">
              <ul className="space-y-3">
                {festival.foods.map((food) => (
                  <li key={food.id}>
                    <p className="font-medium text-ink">{food.name}</p>
                    <p className="text-caption text-ink-muted">{food.description}</p>
                  </li>
                ))}
              </ul>
            </Disclosure>
          )}

          {festival.experiences.length > 0 && (
            <Disclosure title="Related Experiences">
              <ul className="space-y-3">
                {festival.experiences.map((experience) => (
                  // No dedicated /experiences/[slug] page exists yet (not part of any
                  // phase's route list so far) — shown as text, not a dead link.
                  <li key={experience.id}>
                    <p className="font-medium text-ink">{experience.name}</p>
                    <p className="text-caption text-ink-muted">{experience.description}</p>
                  </li>
                ))}
              </ul>
            </Disclosure>
          )}

          {(nearbyDestinations.length > 0 || nearbyFestivals.length > 0) && (
            <Disclosure title="Nearby" defaultOpen>
              <NearbyDiscovery festivals={nearbyFestivals} destinations={nearbyDestinations} />
            </Disclosure>
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
                "@type": "Festival",
                name: festival.name,
                description: festival.description,
                startDate: occurrence?.startDate?.toISOString(),
                endDate: occurrence?.endDate?.toISOString(),
                location: {
                  "@type": "Place",
                  name: location.name,
                  geo:
                    festival.latitude != null && festival.longitude != null
                      ? { "@type": "GeoCoordinates", latitude: festival.latitude, longitude: festival.longitude }
                      : undefined,
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Festivals", item: `${siteConfig.url}/festivals` },
                  { "@type": "ListItem", position: 2, name: festival.name, item: `${siteConfig.url}/festivals/${festival.slug}` },
                ],
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
