import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFestivalBySlug } from "@/features/festivals/service";
import { getDestinationBySlug } from "@/features/destinations/service";
import { mapDiscoveryQuerySchema } from "@/lib/validation";

export interface DiscoveryPreview {
  kind: "festival" | "destination" | "experience" | "event";
  slug: string | null;
  name: string;
  locationName: string | null;
  description: string | null;
  dateLabel: string | null;
  tags: string[];
}

/**
 * Powers the map's discovery preview panel — a small, panel-sized payload
 * fetched on marker click, kept separate from the viewport endpoint (which
 * stays lightweight for potentially hundreds of markers at once).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = mapDiscoveryQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { kind, identifier } = parsed.data;

  let preview: DiscoveryPreview | null = null;

  if (kind === "festival") {
    const festival = await getFestivalBySlug(identifier);
    if (festival) {
      const nextOccurrence = festival.occurrences[0];
      preview = {
        kind,
        slug: festival.slug,
        name: festival.name,
        locationName: festival.location.name,
        description: festival.description,
        dateLabel: nextOccurrence?.startDate
          ? nextOccurrence.startDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
          : "Date not yet announced",
        tags: festival.tags.map((t) => t.name),
      };
    }
  } else if (kind === "destination") {
    const destination = await getDestinationBySlug(identifier);
    if (destination) {
      preview = {
        kind,
        slug: destination.slug,
        name: destination.name,
        locationName: destination.location.name,
        description: destination.description,
        dateLabel:
          destination.bestTimeStartMonth != null && destination.bestTimeEndMonth != null
            ? `Best time: ${MONTHS[destination.bestTimeStartMonth - 1]}–${MONTHS[destination.bestTimeEndMonth - 1]}`
            : null,
        tags: destination.tags.map((t) => t.name),
      };
    }
  } else if (kind === "experience") {
    const experience = await db.experience.findFirst({
      where: { slug: identifier },
      include: { tags: true, location: true },
    });
    if (experience) {
      preview = {
        kind,
        slug: experience.slug,
        name: experience.name,
        locationName: experience.location.name,
        description: experience.description,
        dateLabel: null,
        tags: experience.tags.map((t) => t.name),
      };
    }
  } else if (kind === "event") {
    // Events have no slug/detail page yet — the panel shows this inline, no "Explore" link.
    const event = await db.event.findFirst({ where: { id: identifier }, include: { location: true } });
    if (event) {
      preview = {
        kind,
        slug: null,
        name: event.name,
        locationName: event.location?.name ?? null,
        description: null,
        dateLabel: event.date
          ? event.date.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
          : null,
        tags: [],
      };
    }
  }

  if (!preview) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(preview);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
