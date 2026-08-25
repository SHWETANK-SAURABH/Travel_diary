import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedDestinations } from "@/features/destinations/service";
import { Container } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Browse India's destinations — famous and hidden, by budget and by state.",
};

export default async function DestinationsPage() {
  const destinations = await listPublishedDestinations();

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl">Destinations</h1>
      <p className="mt-2 text-ink-muted">
        {destinations.length === 0
          ? "No destinations published yet — this list fills in as seed/CMS content is added."
          : `${destinations.length} destination${destinations.length === 1 ? "" : "s"}`}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((destination) => (
          <Link key={destination.id} href={`/destinations/${destination.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-panel">
              <CardHeader>
                <CardTitle>{destination.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {destination.budgetLevel && (
                  <Badge variant="neutral">{destination.budgetLevel.replace("_", " ").toLowerCase()}</Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
