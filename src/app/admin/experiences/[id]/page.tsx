import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { adminGetExperience } from "@/features/experiences/admin-service";
import { mediaFor } from "@/lib/media";
import { ExperienceForm, type ExperienceFormInitial } from "../ExperienceForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExperiencePage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const [experience, media] = await Promise.all([adminGetExperience(session, id), mediaFor("EXPERIENCE", id)]);

  if (!experience) notFound();

  const initial: ExperienceFormInitial = {
    id: experience.id,
    name: experience.name,
    slug: experience.slug,
    description: experience.description,
    category: experience.category,
    status: experience.status,
    featured: experience.featured,
    locationId: experience.locationId,
    locationName: experience.location.name,
    latitude: experience.latitude,
    longitude: experience.longitude,
    tags: experience.tags,
    destinations: experience.destinations,
    festivals: experience.festivals,
    media,
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-h1">{experience.name}</h1>
      <ExperienceForm mode="edit" initial={initial} />
    </div>
  );
}
