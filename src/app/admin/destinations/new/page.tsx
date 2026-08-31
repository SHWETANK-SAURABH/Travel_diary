import { db } from "@/lib/db";
import { DestinationForm } from "../DestinationForm";

export default async function NewDestinationPage() {
  const categories = await db.destinationCategory.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-h1">New destination</h1>
      <DestinationForm mode="create" categories={categories} />
    </div>
  );
}
