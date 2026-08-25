import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFestivalBySlug } from "@/features/festivals/service";
import { Container } from "@/components/layout";
import { Badge } from "@/components/ui";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const festival = await getFestivalBySlug(slug);
  if (!festival) return {};

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
    },
  };
}

export default async function FestivalDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const festival = await getFestivalBySlug(slug);
  if (!festival) notFound();

  const nextOccurrence = festival.occurrences[0];

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="marigold">{festival.category.name}</Badge>
        <Badge variant="neutral">{festival.popularity.replace("_", " ").toLowerCase()}</Badge>
      </div>
      <h1 className="mt-3 font-display text-4xl">{festival.name}</h1>
      <p className="mt-2 text-ink-muted">{festival.location.name}</p>

      {nextOccurrence && (
        <p className="mt-4 text-sm text-ink-muted">
          Next occurrence: {nextOccurrence.startDate?.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) ?? "date not yet announced"}{" "}
          <Badge variant="neutral" className="ml-1">
            {nextOccurrence.dateConfidence.replace(/_/g, " ").toLowerCase()}
          </Badge>
        </p>
      )}

      <p className="mt-6 max-w-2xl text-base leading-relaxed">{festival.description}</p>

      {festival.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {festival.tags.map((tag) => (
            <Badge key={tag.id} variant="neutral">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Festival",
            name: festival.name,
            description: festival.description,
            startDate: nextOccurrence?.startDate?.toISOString(),
            endDate: nextOccurrence?.endDate?.toISOString(),
            location: {
              "@type": "Place",
              name: festival.location.name,
              geo:
                festival.latitude != null && festival.longitude != null
                  ? { "@type": "GeoCoordinates", latitude: festival.latitude, longitude: festival.longitude }
                  : undefined,
            },
            // Escape "<" so admin-authored content can never prematurely close this
            // <script> tag (e.g. a description containing "</script>").
          }).replace(/</g, "\\u003c"),
        }}
      />
    </Container>
  );
}
