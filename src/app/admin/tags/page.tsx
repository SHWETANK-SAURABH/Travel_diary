import { auth } from "@/lib/auth";
import { adminListTags } from "@/features/taxonomy/admin-service";
import { TagManager, type TagRow } from "./TagManager";

export default async function AdminTagsPage() {
  const session = await auth();
  const tags = await adminListTags(session, { includeArchived: true });

  const rows: TagRow[] = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    category: tag.category,
    archived: tag.archived,
    usageCount: tag._count.festivals + tag._count.destinations + tag._count.experiences + tag._count.foods,
  }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-h1">Tags</h1>
      <TagManager tags={rows} />
    </div>
  );
}
