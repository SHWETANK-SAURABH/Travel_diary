"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea } from "@/components/ui";
import { RelationPicker, type RelationOption } from "@/components/admin/RelationPicker";
import { ContentStatusPill } from "@/components/admin/StatusPill";
import { MediaEditor } from "../festivals/FestivalForm";
import { createExperienceAction, updateExperienceAction, addExperienceMediaAction, deleteExperienceMediaAction } from "./actions";

export interface ExperienceFormInitial {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  locationId: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  tags: RelationOption[];
  destinations: RelationOption[];
  festivals: RelationOption[];
  media: { id: string; url: string; altText: string | null; order: number }[];
}

/** Deliberately a single simple form, not tabbed (spec §16: "keep the interface simpler than Festival/Destination CMS"). */
export function ExperienceForm({ mode, initial }: { mode: "create" | "edit"; initial?: ExperienceFormInitial }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [location, setLocation] = useState<RelationOption[]>(initial ? [{ id: initial.locationId, name: initial.locationName }] : []);
  const [latitude, setLatitude] = useState(initial?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(initial?.longitude?.toString() ?? "");
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
      category: category || undefined,
      status,
      featured,
      locationId: location[0]?.id,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      tagIds: tags.map((t) => t.id),
      destinationIds: destinations.map((t) => t.id),
      festivalIds: festivals.map((t) => t.id),
    };
    const result = mode === "create" ? await createExperienceAction(input) : await updateExperienceAction(initial!.id, input);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (mode === "create") router.push(`/admin/experiences/${result.data.id}`);
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
      <Field label="Category" hint="Free-form for now">
        <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Adventure, Wellness, Craft" />
      </Field>
      <RelationPicker label="Location" searchType="location" value={location} onChange={setLocation} single placeholder="Search states, cities…" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Latitude">
          <Input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
        </Field>
        <Field label="Longitude">
          <Input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
        </Field>
      </div>
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
          <MediaEditor contentType="EXPERIENCE" contentId={initial.id} media={initial.media} onAdd={addExperienceMediaAction} onDelete={(mediaId) => deleteExperienceMediaAction(mediaId, initial.id)} />
        </div>
      )}

      {error && <p role="alert" className="text-caption text-danger">{error}</p>}
      <div className="border-t border-border pt-4">
        <Button onClick={handleSave} loading={saving} disabled={!name.trim() || !description.trim() || !location[0]}>
          {mode === "create" ? "Create experience" : "Save changes"}
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
