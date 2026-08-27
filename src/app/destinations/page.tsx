import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedDestinations } from "@/features/destinations/service";
import { Container } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent, Badge, EmptyState } from "@/components/ui";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Browse India's destinations — famous and hidden, by budget and by state.",
};

export default async function DestinationsPage() {
  const destinations = await listPublishedDestinations();

  return (
    <Container className="py-12">
      <h1 className="text-h1 font-display">Destinations</h1>
      {destinations.length > 0 && (
        <p className="mt-2 text-body text-ink-muted">
          {destinations.length} destination{destinations.length === 1 ? "" : "s"}
        </p>
      )}

      {destinations.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No destinations published yet"
          description="This list fills in as seed/CMS content is added."
        />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <Link key={destination.id} href={`/destinations/${destination.slug}`}>
              <Card className="h-full transition-shadow duration-base hover:shadow-panel">
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
      )}
    </Container>
  );
}
