import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminGetDestination } from "@/features/destinations/admin-service";
import { getDestinationMedia } from "@/features/destinations/service";
import { DestinationForm, type DestinationFormInitial } from "../DestinationForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDestinationPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const [destination, categories, media] = await Promise.all([adminGetDestination(session, id), db.destinationCategory.findMany({ orderBy: { order: "asc" } }), getDestinationMedia(id)]);

  if (!destination) notFound();

  const initial: DestinationFormInitial = {
    id: destination.id,
    name: destination.name,
    slug: destination.slug,
    description: destination.description,
    categoryId: destination.categoryId,
    status: destination.status,
    popularity: destination.popularity,
    featured: destination.featured,
    locationId: destination.locationId,
    locationName: destination.location.name,
    latitude: destination.latitude,
    longitude: destination.longitude,
    precision: destination.precision,
    bestTimeStartMonth: destination.bestTimeStartMonth,
    bestTimeEndMonth: destination.bestTimeEndMonth,
    altTimeStartMonth: destination.altTimeStartMonth,
    altTimeEndMonth: destination.altTimeEndMonth,
    bestTimeExplanation: destination.bestTimeExplanation,
    bestTimeSource: destination.bestTimeSource,
    budgetLevel: destination.budgetLevel,
    approximateCostPerDay: destination.approximateCostPerDay,
    verificationStatus: destination.verificationStatus,
    tags: destination.tags,
    experiences: destination.experiences,
    foods: destination.foods,
    media,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-h1">{destination.name}</h1>
        {destination.status === "PUBLISHED" ? (
          <Link href={`/destinations/${destination.slug}`} target="_blank" className="text-caption text-marigold-600 hover:underline">
            Preview live page ↗
          </Link>
        ) : (
          <span className="text-caption text-ink-muted">Publish to preview the live page</span>
        )}
      </div>
      <DestinationForm mode="edit" categories={categories} initial={initial} />
    </div>
  );
}
