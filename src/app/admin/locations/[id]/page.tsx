import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { adminGetLocation } from "@/features/locations/admin-service";
import { LocationForm, type LocationFormInitial } from "../LocationForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLocationPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const location = await adminGetLocation(session, id);
  if (!location) notFound();

  const initial: LocationFormInitial = {
    id: location.id,
    type: location.type,
    name: location.name,
    slug: location.slug,
    parentId: location.parentId,
    parentName: location.parent?.name ?? null,
    latitude: location.latitude,
    longitude: location.longitude,
    precision: location.precision,
    nearestAirport: location.nearestAirport,
    nearestRailwayStation: location.nearestRailwayStation,
    roadAccessNotes: location.roadAccessNotes,
    localTransportNotes: location.localTransportNotes,
    accommodationNotes: location.accommodationNotes,
    childCount: location.children.length,
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-h1">{location.name}</h1>
      <LocationForm mode="edit" initial={initial} />
    </div>
  );
}
