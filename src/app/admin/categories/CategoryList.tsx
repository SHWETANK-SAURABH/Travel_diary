"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import type { CategoryDomain } from "@/features/taxonomy/admin-service";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "./actions";

export interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  order: number;
  contentCount: number;
}

export function CategoryList({ domain, title, initial }: { domain: CategoryDomain; title: string; initial: CategoryRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    setSaving(true);
    setError(null);
    const result = await createCategoryAction(domain, { name: newName, order: initial.length });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNewName("");
    setCreating(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-h3">{title}</h2>
        {!creating && (
          <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
            New category
          </Button>
        )}
      </div>

      {creating && (
        <div className="mt-3 flex items-center gap-2">
          <Input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name" className="h-9 max-w-xs" />
          <Button size="sm" onClick={handleCreate} loading={saving} disabled={!newName.trim()}>
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>
            Cancel
          </Button>
        </div>
      )}
      {error && <p className="mt-1 text-caption text-danger">{error}</p>}

      <div className="mt-3 flex flex-col gap-2">
        {initial.length === 0 && <p className="text-caption text-ink-muted">No categories yet.</p>}
        {initial.map((category) => (
          <CategoryRowItem key={category.id} domain={domain} category={category} />
        ))}
      </div>
    </div>
  );
}

function CategoryRowItem({ domain, category }: { domain: CategoryDomain; category: CategoryRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRename() {
    setSaving(true);
    setError(null);
    const result = await updateCategoryAction(domain, category.id, { name });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${category.name}"?`)) return;
    const result = await deleteCategoryAction(domain, category.id);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      {editing ? (
        <div className="flex flex-1 items-center gap-2">
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} className="h-8 max-w-xs" />
          <Button size="sm" onClick={handleRename} loading={saving}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          {error && <span className="text-caption text-danger">{error}</span>}
        </div>
      ) : (
        <>
          <span className="text-sm text-ink">
            {category.name} <span className="text-caption text-ink-muted">({category.contentCount})</span>
          </span>
          <div className="flex gap-3 text-caption">
            <button type="button" onClick={() => setEditing(true)} className="text-marigold-600 hover:underline">
              Rename
            </button>
            <button type="button" onClick={handleDelete} className="text-danger hover:underline" disabled={category.contentCount > 0} title={category.contentCount > 0 ? "In use — reassign content first" : undefined}>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
