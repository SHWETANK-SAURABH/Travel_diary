import { db } from "@/lib/db";
import { FestivalForm } from "../FestivalForm";

export default async function NewFestivalPage() {
  const categories = await db.festivalCategory.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-h1">New festival</h1>
      <FestivalForm mode="create" categories={categories} />
    </div>
  );
}
