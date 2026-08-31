import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { adminGetFood } from "@/features/food/admin-service";
import { mediaFor } from "@/lib/media";
import { FoodForm, type FoodFormInitial } from "../FoodForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFoodPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const [food, media] = await Promise.all([adminGetFood(session, id), mediaFor("FOOD", id)]);

  if (!food) notFound();

  const initial: FoodFormInitial = {
    id: food.id,
    name: food.name,
    slug: food.slug,
    description: food.description,
    region: food.region,
    status: food.status,
    featured: food.featured,
    locationId: food.locationId,
    locationName: food.location?.name ?? null,
    tags: food.tags,
    destinations: food.destinations,
    festivals: food.festivals,
    media,
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-h1">{food.name}</h1>
      <FoodForm mode="edit" initial={initial} />
    </div>
  );
}
