import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminGetFestival } from "@/features/festivals/admin-service";
import { getFestivalMedia } from "@/features/festivals/service";
import { FestivalForm, type FestivalFormInitial } from "../FestivalForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFestivalPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const [festival, categories, media] = await Promise.all([adminGetFestival(session, id), db.festivalCategory.findMany({ orderBy: { order: "asc" } }), getFestivalMedia(id)]);

  if (!festival) notFound();

  const initial: FestivalFormInitial = {
    id: festival.id,
    name: festival.name,
    slug: festival.slug,
    description: festival.description,
    categoryId: festival.categoryId,
    status: festival.status,
    popularity: festival.popularity,
    featured: festival.featured,
    locationId: festival.locationId,
    locationName: festival.location.name,
    latitude: festival.latitude,
    longitude: festival.longitude,
    precision: festival.precision,
    recurrenceType: festival.recurrenceType,
    recurrenceNotes: festival.recurrenceNotes,
    typicalDurationDays: festival.typicalDurationDays,
    verificationStatus: festival.verificationStatus,
    verificationSource: festival.verificationSource,
    lastVerifiedAt: festival.lastVerifiedAt,
    tags: festival.tags,
    travellerFitTags: festival.travellerFitTags,
    destinations: festival.destinations,
    experiences: festival.experiences,
    foods: festival.foods,
    occurrences: festival.occurrences,
    media,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h1">{festival.name}</h1>
        {festival.status === "PUBLISHED" ? (
          <Link href={`/festivals/${festival.slug}`} target="_blank" className="text-caption text-marigold-600 hover:underline">
            Preview live page ↗
          </Link>
        ) : (
          <span className="text-caption text-ink-muted">Publish to preview the live page</span>
        )}
      </div>
      <FestivalForm mode="edit" categories={categories} initial={initial} />
    </div>
  );
}
