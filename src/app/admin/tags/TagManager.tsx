"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Badge } from "@/components/ui";
import { createTagAction, renameTagAction, setTagArchivedAction } from "./actions";

export interface TagRow {
  id: string;
  name: string;
  category: "INTEREST" | "TRAVELLER_FIT" | "GENERAL";
  archived: boolean;
  usageCount: number;
}

const CATEGORY_LABEL: Record<TagRow["category"], string> = { INTEREST: "Interest", TRAVELLER_FIT: "Traveller-fit", GENERAL: "General" };

export function TagManager({ tags }: { tags: TagRow[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TagRow["category"]>("GENERAL");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setSaving(true);
    setError(null);
    const result = await createTagAction({ name, category });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-border p-4">
        <label className="flex flex-col gap-1 text-sm text-ink">
          <span className="font-medium">New tag</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Beach, Trekking" className="w-56" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          <span className="font-medium">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as TagRow["category"])} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
            <option value="GENERAL">General</option>
            <option value="INTEREST">Interest</option>
            <option value="TRAVELLER_FIT">Traveller-fit</option>
          </select>
        </label>
        <Button onClick={handleCreate} loading={saving} disabled={!name.trim()}>
          Add tag
        </Button>
        {error && <p className="w-full text-caption text-danger">{error}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagChip key={tag.id} tag={tag} />
        ))}
        {tags.length === 0 && <p className="text-caption text-ink-muted">No tags yet.</p>}
      </div>
    </div>
  );
}

function TagChip({ tag }: { tag: TagRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tag.name);
  const [saving, setSaving] = useState(false);

  async function handleRename() {
    setSaving(true);
    const result = await renameTagAction(tag.id, name);
    setSaving(false);
    if (result.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  async function handleToggleArchive() {
    await setTagArchivedAction(tag.id, !tag.archived);
    router.refresh();
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border py-1 pr-1 pl-2.5 text-xs">
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-6 w-28 px-1.5 text-xs" autoFocus />
        <button type="button" onClick={handleRename} disabled={saving} className="px-1 text-marigold-600">
          ✓
        </button>
        <button type="button" onClick={() => setEditing(false)} className="px-1 text-ink-muted">
          ×
        </button>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full py-1 pr-1.5 pl-2.5 text-xs ${tag.archived ? "bg-border/40 text-ink-muted" : "bg-marigold-50 text-marigold-600"}`}>
      {tag.name}
      <Badge variant="neutral" className="text-[10px]">
        {CATEGORY_LABEL[tag.category]}
      </Badge>
      <span className="text-ink-muted">({tag.usageCount})</span>
      <button type="button" onClick={() => setEditing(true)} className="hover:underline">
        Rename
      </button>
      <button type="button" onClick={handleToggleArchive} className="hover:underline">
        {tag.archived ? "Unarchive" : "Archive"}
      </button>
    </span>
  );
}
