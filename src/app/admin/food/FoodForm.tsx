"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea } from "@/components/ui";
import { RelationPicker, type RelationOption } from "@/components/admin/RelationPicker";
import { ContentStatusPill } from "@/components/admin/StatusPill";
import { MediaEditor } from "../festivals/FestivalForm";
import { createFoodAction, updateFoodAction, addFoodMediaAction, deleteFoodMediaAction } from "./actions";

export interface FoodFormInitial {
  id: string;
  name: string;
  slug: string;
  description: string;
  region: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  locationId: string | null;
  locationName: string | null;
  tags: RelationOption[];
  destinations: RelationOption[];
  festivals: RelationOption[];
  media: { id: string; url: string; altText: string | null; order: number }[];
}

/** Simple single-page form, same restraint as Experience (spec §17). */
export function FoodForm({ mode, initial }: { mode: "create" | "edit"; initial?: FoodFormInitial }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [location, setLocation] = useState<RelationOption[]>(initial?.locationId ? [{ id: initial.locationId, name: initial.locationName ?? "" }] : []);
  const [tags, setTags] = useState<RelationOption[]>(initial?.tags ?? []);
  const [destinations, setDestinations] = useState<RelationOption[]>(initial?.destinations ?? []);
  const [festivals, setFestivals] = useState<RelationOption[]>(initial?.festivals ?? []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const input = {
      name,
      slug: slug || undefined,
      description,
      region: region || undefined,
      status,
      featured,
      locationId: location[0]?.id,
      tagIds: tags.map((t) => t.id),
      destinationIds: destinations.map((t) => t.id),
      festivalIds: festivals.map((t) => t.id),
    };
    const result = mode === "create" ? await createFoodAction(input) : await updateFoodAction(initial!.id, input);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (mode === "create") router.push(`/admin/food/${result.data.id}`);
    else router.refresh();
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      {initial && <ContentStatusPill status={status} />}
      <Field label="Name">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Slug" hint="Leave blank to derive from name">
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
      </Field>
      <Field label="Description">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-32" />
      </Field>
      <Field label="Region">
        <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Coastal Kerala" />
      </Field>
      <RelationPicker label="Location" searchType="location" value={location} onChange={setLocation} single placeholder="Search states, cities… (optional)" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </Field>
        <label className="mt-6 flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 rounded border-border" />
          Featured
        </label>
      </div>
      <RelationPicker label="Tags" searchType="tag" value={tags} onChange={setTags} />
      <RelationPicker label="Destinations" searchType="destination" value={destinations} onChange={setDestinations} />
      <RelationPicker label="Festivals" searchType="festival" value={festivals} onChange={setFestivals} />

      {mode === "edit" && initial && (
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Media</p>
          <MediaEditor contentType="FOOD" contentId={initial.id} media={initial.media} onAdd={addFoodMediaAction} onDelete={(mediaId) => deleteFoodMediaAction(mediaId, initial.id)} />
        </div>
      )}

      {error && <p role="alert" className="text-caption text-danger">{error}</p>}
      <div className="border-t border-border pt-4">
        <Button onClick={handleSave} loading={saving} disabled={!name.trim() || !description.trim()}>
          {mode === "create" ? "Create food" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink">
      <span className="font-medium">{label}</span>
      {children}
      {hint && <span className="text-caption text-ink-muted">{hint}</span>}
    </label>
  );
}
