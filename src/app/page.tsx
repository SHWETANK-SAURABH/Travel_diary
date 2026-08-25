import Link from "next/link";
import { Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { siteConfig } from "@/config/site";

/**
 * Deliberately minimal — the real homepage (Living Map hero, festival rail,
 * discovery feed) is Phase 2+. This exists so `/` renders something real
 * and links into the three pillars while the foundation is being built.
 */
export default function HomePage() {
  return (
    <Container className="flex flex-1 flex-col items-start justify-center gap-8 py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-medium tracking-wide text-marigold-600 uppercase">
          {siteConfig.tagline}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
          Discover India, one festival, one destination, one story at a time.
        </h1>
        <p className="mt-4 text-lg text-ink-muted">{siteConfig.description}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/explore">
          <Button size="lg">Start exploring</Button>
        </Link>
        <Link href="/map">
          <Button size="lg" variant="outline">
            Open the map
          </Button>
        </Link>
      </div>
    </Container>
  );
}
