import Link from "next/link";
import { Card, CardContent, Badge } from "@/components/ui";

export interface NearbyItem {
  id: string;
  slug: string;
  name: string;
}

export interface NearbyDiscoveryProps {
  festivals: NearbyItem[];
  destinations: NearbyItem[];
}

/** "You're visiting this festival — also explore nearby" — geographic proximity, not curated relations (see getNearbyToFestival). */
export function NearbyDiscovery({ festivals, destinations }: NearbyDiscoveryProps) {
  if (festivals.length === 0 && destinations.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {destinations.map((d) => (
        <Link key={d.id} href={`/destinations/${d.slug}`}>
          <Card className="transition-shadow duration-base hover:shadow-panel">
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-body text-ink">{d.name}</span>
              <Badge variant="neutral">Destination</Badge>
            </CardContent>
          </Card>
        </Link>
      ))}
      {festivals.map((f) => (
        <Link key={f.id} href={`/festivals/${f.slug}`}>
          <Card className="transition-shadow duration-base hover:shadow-panel">
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-body text-ink">{f.name}</span>
              <Badge variant="marigold">Festival</Badge>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
