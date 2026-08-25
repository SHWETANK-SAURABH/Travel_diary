import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedFestivals } from "@/features/festivals/service";
import { Container } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Festivals",
  description: "Browse India's festivals — regional, harvest, food, arts and modern celebrations.",
};

export default async function FestivalsPage() {
  const festivals = await listPublishedFestivals();

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl">Festivals</h1>
      <p className="mt-2 text-ink-muted">
        {festivals.length === 0
          ? "No festivals published yet — this list fills in as seed/CMS content is added."
          : `${festivals.length} festival${festivals.length === 1 ? "" : "s"}`}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {festivals.map((festival) => (
          <Link key={festival.id} href={`/festivals/${festival.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-panel">
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
    </Container>
  );
}
