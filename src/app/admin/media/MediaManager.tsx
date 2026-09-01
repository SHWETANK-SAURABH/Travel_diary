"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { RelationPicker, type RelationOption, type RelationSearchType } from "@/components/admin/RelationPicker";
import { createMediaAction, updateMediaAction, deleteMediaAction } from "./actions";

export interface MediaRow {
  id: string;
  url: string;
  altText: string | null;
  order: number;
  contentType: "FESTIVAL" | "DESTINATION" | "EXPERIENCE" | "FOOD" | "EVENT";
  contentId: string;
  contentLabel: string | null;
}

const CONTENT_TYPES: { value: MediaRow["contentType"]; label: string; searchType: RelationSearchType }[] = [
  { value: "FESTIVAL", label: "Festival", searchType: "festival" },
  { value: "DESTINATION", label: "Destination", searchType: "destination" },
  { value: "EXPERIENCE", label: "Experience", searchType: "experience" },
  { value: "FOOD", label: "Food", searchType: "food" },
];

export function AddMediaForm() {
  const router = useRouter();
  const [contentType, setContentType] = useState<MediaRow["contentType"]>("FESTIVAL");
  const [content, setContent] = useState<RelationOption[]>([]);
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchType = CONTENT_TYPES.find((c) => c.value === contentType)!.searchType;

  async function handleAdd() {
    setSaving(true);
    setError(null);
    const result = await createMediaAction({ url, altText: altText || undefined, order, contentType, contentId: content[0]?.id });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setUrl("");
    setAltText("");
    setContent([]);
    router.refresh();
  }

  return (
    <div className="rounded-md border border-dashed border-border p-4">
      <p className="mb-3 text-sm font-medium text-ink">Add image by URL</p>
      <p className="mb-3 text-caption text-ink-muted">No file upload is configured in this environment — paste a hosted image URL (see docs/architecture.md).</p>
      <div className="flex flex-col gap-3 sm:max-w-xl">
        <label className="flex flex-col gap-1 text-sm text-ink">
          <span className="font-medium">Content type</span>
          <select
            value={contentType}
            onChange={(e) => {
              setContentType(e.target.value as MediaRow["contentType"]);
              setContent([]);
            }}
            className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink"
          >
            {CONTENT_TYPES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <RelationPicker label="Content item" searchType={searchType} value={content} onChange={setContent} single />
        <label className="flex flex-col gap-1 text-sm text-ink">
          <span className="font-medium">Image URL</span>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          <span className="font-medium">Alt text</span>
          <Input value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Describe the image — never the filename" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          <span className="font-medium">Order</span>
          <Input type="number" min={0} value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-24" />
        </label>
        {error && <p role="alert" className="text-caption text-danger">{error}</p>}
        <Button size="sm" onClick={handleAdd} loading={saving} disabled={!url.trim() || !content[0]} className="self-start">
          Add image
        </Button>
      </div>
    </div>
  );
}

export function MediaRowActions({ row }: { row: MediaRow }) {
  const router = useRouter();
  const [altText, setAltText] = useState(row.altText ?? "");
  const [order, setOrder] = useState(row.order);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateMediaAction(row.id, { altText: altText || undefined, order });
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Remove this image?")) return;
    await deleteMediaAction(row.id);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Alt text" className="h-8 w-40 text-caption" />
      <Input type="number" min={0} value={order} onChange={(e) => setOrder(Number(e.target.value))} className="h-8 w-16 text-caption" />
      <button type="button" onClick={handleSave} disabled={saving} className="text-caption text-marigold-600 hover:underline disabled:opacity-50">
        Save
      </button>
      <button type="button" onClick={handleDelete} className="text-caption text-danger hover:underline">
        Remove
      </button>
    </div>
  );
}
