import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/features/destinations/service";
import { Container } from "@/components/layout";
import { Badge } from "@/components/ui";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return {};

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
    },
  };
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function DestinationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  return (
    <Container className="py-12">
      {destination.budgetLevel && <Badge variant="marigold">{destination.budgetLevel.replace("_", " ").toLowerCase()}</Badge>}
      <h1 className="mt-3 font-display text-display">{destination.name}</h1>
      <p className="mt-2 text-ink-muted">{destination.location.name}</p>

      {destination.bestTimeStartMonth != null && destination.bestTimeEndMonth != null && (
        <p className="mt-4 text-sm text-ink-muted">
          Best time to visit: {MONTH_NAMES[destination.bestTimeStartMonth - 1]}–
          {MONTH_NAMES[destination.bestTimeEndMonth - 1]}
        </p>
      )}

      <p className="mt-6 max-w-2xl text-base leading-relaxed">{destination.description}</p>

      {destination.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {destination.tags.map((tag) => (
            <Badge key={tag.id} variant="neutral">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristAttraction",
            name: destination.name,
            description: destination.description,
            geo:
              destination.latitude != null && destination.longitude != null
                ? { "@type": "GeoCoordinates", latitude: destination.latitude, longitude: destination.longitude }
                : undefined,
          }).replace(/</g, "\\u003c"),
        }}
      />
    </Container>
  );
}
