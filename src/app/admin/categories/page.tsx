import { auth } from "@/lib/auth";
import { adminListCategories } from "@/features/taxonomy/admin-service";
import { CategoryList } from "./CategoryList";

export default async function AdminCategoriesPage() {
  const session = await auth();
  const [festivalCategories, destinationCategories] = await Promise.all([adminListCategories(session, "FESTIVAL_CATEGORY"), adminListCategories(session, "DESTINATION_CATEGORY")]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-h1">Categories</h1>
      <CategoryList domain="FESTIVAL_CATEGORY" title="Festival categories" initial={festivalCategories} />
      <CategoryList domain="DESTINATION_CATEGORY" title="Destination types" initial={destinationCategories} />
    </div>
  );
}
