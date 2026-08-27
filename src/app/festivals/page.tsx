import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedFestivals } from "@/features/festivals/service";
import { Container } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent, Badge, EmptyState } from "@/components/ui";

export const metadata: Metadata = {
  title: "Festivals",
  description: "Browse India's festivals — regional, harvest, food, arts and modern celebrations.",
};

interface PageProps {
  searchParams: Promise<{ state?: string }>;
}

export default async function FestivalsPage({ searchParams }: PageProps) {
  const { state } = await searchParams;
  const festivals = await listPublishedFestivals({ stateSlug: state });

  return (
    <Container className="py-12">
      <h1 className="text-h1 font-display">Festivals</h1>
      {festivals.length > 0 && (
        <p className="mt-2 text-body text-ink-muted">
          {festivals.length} festival{festivals.length === 1 ? "" : "s"}
        </p>
      )}

      {festivals.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No festivals published yet"
          description={
            state
              ? "No festivals in this state yet — try clearing the filter."
              : "This list fills in as seed/CMS content is added."
          }
        />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {festivals.map((festival) => (
            <Link key={festival.id} href={`/festivals/${festival.slug}`}>
              <Card className="h-full transition-shadow duration-base hover:shadow-panel">
                <CardHeader>
                  <Badge variant="marigold">{festival.category.name}</Badge>
                  <CardTitle className="mt-2">{festival.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="neutral">{festival.popularity.replace("_", " ").toLowerCase()}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
