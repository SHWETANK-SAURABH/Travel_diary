"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { RelationPicker, type RelationOption } from "@/components/admin/RelationPicker";
import { ContentStatusPill, VerificationPill } from "@/components/admin/StatusPill";
import { MediaEditor } from "../festivals/FestivalForm";
import { createDestinationAction, updateDestinationAction, verifyDestinationBestTimeAction, addDestinationMediaAction, deleteDestinationMediaAction } from "./actions";

interface CategoryOption {
  id: string;
  name: string;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export interface DestinationFormInitial {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  popularity: "POPULAR" | "HIDDEN" | "LOCAL_EMERGING";
  featured: boolean;
  locationId: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  precision: "EXACT" | "APPROXIMATE";
  bestTimeStartMonth: number | null;
  bestTimeEndMonth: number | null;
  altTimeStartMonth: number | null;
  altTimeEndMonth: number | null;
  bestTimeExplanation: string | null;
  bestTimeSource: "UNVERIFIED" | "AI_GENERATED" | "ADMIN_VERIFIED" | "ADMIN_OVERRIDDEN";
  budgetLevel: "BUDGET" | "MID_RANGE" | "LUXURY" | null;
  approximateCostPerDay: number | null;
  verificationStatus: "UNVERIFIED" | "AI_GENERATED" | "ADMIN_VERIFIED" | "ADMIN_OVERRIDDEN";
  tags: RelationOption[];
  experiences: RelationOption[];
  foods: RelationOption[];
  media: { id: string; url: string; altText: string | null; order: number }[];
}

export function DestinationForm({ mode, categories, initial }: { mode: "create" | "edit"; categories: CategoryOption[]; initial?: DestinationFormInitial }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [popularity, setPopularity] = useState(initial?.popularity ?? "LOCAL_EMERGING");
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const [location, setLocation] = useState<RelationOption[]>(initial ? [{ id: initial.locationId, name: initial.locationName }] : []);
  const [latitude, setLatitude] = useState(initial?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(initial?.longitude?.toString() ?? "");
  const [precision, setPrecision] = useState(initial?.precision ?? "APPROXIMATE");

  const [bestTimeStartMonth, setBestTimeStartMonth] = useState(initial?.bestTimeStartMonth?.toString() ?? "");
  const [bestTimeEndMonth, setBestTimeEndMonth] = useState(initial?.bestTimeEndMonth?.toString() ?? "");
  const [altTimeStartMonth, setAltTimeStartMonth] = useState(initial?.altTimeStartMonth?.toString() ?? "");
  const [altTimeEndMonth, setAltTimeEndMonth] = useState(initial?.altTimeEndMonth?.toString() ?? "");
  const [bestTimeExplanation, setBestTimeExplanation] = useState(initial?.bestTimeExplanation ?? "");

  const [budgetLevel, setBudgetLevel] = useState(initial?.budgetLevel ?? "");
  const [approximateCostPerDay, setApproximateCostPerDay] = useState(initial?.approximateCostPerDay?.toString() ?? "");

  const [experiences, setExperiences] = useState<RelationOption[]>(initial?.experiences ?? []);
  const [foods, setFoods] = useState<RelationOption[]>(initial?.foods ?? []);
  const [tags, setTags] = useState<RelationOption[]>(initial?.tags ?? []);

  const [verifying, setVerifying] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const input = {
      name,
      slug: slug || undefined,
      description,
      categoryId: categoryId || undefined,
      status,
      popularity,
      featured,
      locationId: location[0]?.id,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      precision,
      bestTimeStartMonth: bestTimeStartMonth ? Number(bestTimeStartMonth) : undefined,
      bestTimeEndMonth: bestTimeEndMonth ? Number(bestTimeEndMonth) : undefined,
      altTimeStartMonth: altTimeStartMonth ? Number(altTimeStartMonth) : undefined,
      altTimeEndMonth: altTimeEndMonth ? Number(altTimeEndMonth) : undefined,
      bestTimeExplanation: bestTimeExplanation || undefined,
      budgetLevel: budgetLevel || undefined,
      approximateCostPerDay: approximateCostPerDay ? Number(approximateCostPerDay) : undefined,
      tagIds: tags.map((t) => t.id),
      experienceIds: experiences.map((t) => t.id),
      foodIds: foods.map((t) => t.id),
    };

    const result = mode === "create" ? await createDestinationAction(input) : await updateDestinationAction(initial!.id, input);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (mode === "create") router.push(`/admin/destinations/${result.data.id}`);
    else router.refresh();
  }

  async function handleVerifyBestTime() {
    if (!initial) return;
    setVerifying(true);
    await verifyDestinationBestTimeAction(initial.id);
    setVerifying(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {initial && (
        <div className="flex items-center gap-2">
          <ContentStatusPill status={status} />
          <VerificationPill status={initial.verificationStatus} />
        </div>
      )}

      <Tabs defaultValue="basic">
        <TabList>
          <Tab value="basic">Basic</Tab>
          <Tab value="location">Location</Tab>
          <Tab value="seasonal">Seasonal</Tab>
          <Tab value="budget">Budget</Tab>
          <Tab value="content">Relationships</Tab>
          {mode === "edit" && <Tab value="media">Media</Tab>}
          <Tab value="taxonomy">Taxonomy</Tab>
        </TabList>

        <TabPanel value="basic">
          <div className="flex max-w-xl flex-col gap-4">
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Slug" hint="Leave blank to derive from name">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </Field>
            <Field label="Description">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-40" />
            </Field>
            <Field label="Category" hint="Optional — unlike festivals, destinations don't require one">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </Field>
              <Field label="Classification">
                <select value={popularity} onChange={(e) => setPopularity(e.target.value as typeof popularity)} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
                  <option value="POPULAR">Popular</option>
                  <option value="LOCAL_EMERGING">Local / emerging</option>
                  <option value="HIDDEN">Hidden gem</option>
                </select>
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 rounded border-border" />
              Featured
            </label>
          </div>
        </TabPanel>

        <TabPanel value="location">
          <div className="flex max-w-xl flex-col gap-4">
            <RelationPicker label="Location" searchType="location" value={location} onChange={setLocation} single placeholder="Search states, cities…" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude">
                <Input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
              </Field>
              <Field label="Longitude">
                <Input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
              </Field>
            </div>
            <Field label="Precision">
              <select value={precision} onChange={(e) => setPrecision(e.target.value as typeof precision)} className="h-10 w-48 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
                <option value="EXACT">Exact</option>
                <option value="APPROXIMATE">Approximate</option>
              </select>
            </Field>
          </div>
        </TabPanel>

        <TabPanel value="seasonal">
          <div className="flex max-w-xl flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Best time — from">
                <MonthSelect value={bestTimeStartMonth} onChange={setBestTimeStartMonth} />
              </Field>
              <Field label="Best time — to">
                <MonthSelect value={bestTimeEndMonth} onChange={setBestTimeEndMonth} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Alternative time — from">
                <MonthSelect value={altTimeStartMonth} onChange={setAltTimeStartMonth} />
              </Field>
              <Field label="Alternative time — to">
                <MonthSelect value={altTimeEndMonth} onChange={setAltTimeEndMonth} />
              </Field>
            </div>
            <Field label="Explanation">
              <Textarea value={bestTimeExplanation} onChange={(e) => setBestTimeExplanation(e.target.value)} placeholder="Why this window — monsoon, festival season, temperature…" />
            </Field>
            {initial && (
              <div className="rounded-md border border-border p-3">
                <p className="text-caption text-ink-muted">
                  Source: <VerificationPill status={initial.bestTimeSource} /> — changing the months above marks this &ldquo;Admin-overridden&rdquo; automatically; the prior value is kept in the audit log (see docs/architecture.md).
                </p>
                {initial.bestTimeSource !== "ADMIN_VERIFIED" && (
                  <Button size="sm" variant="outline" className="mt-2" onClick={handleVerifyBestTime} loading={verifying}>
                    Mark current recommendation as verified
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel value="budget">
          <div className="flex max-w-xl flex-col gap-4">
            <Field label="Budget level">
              <select value={budgetLevel} onChange={(e) => setBudgetLevel(e.target.value)} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
                <option value="">Not set</option>
                <option value="BUDGET">Budget</option>
                <option value="MID_RANGE">Mid-range</option>
                <option value="LUXURY">Luxury</option>
              </select>
            </Field>
            <Field label="Approximate cost per day (₹)">
              <Input type="number" min={0} value={approximateCostPerDay} onChange={(e) => setApproximateCostPerDay(e.target.value)} />
            </Field>
          </div>
        </TabPanel>

        <TabPanel value="content">
          <div className="flex max-w-xl flex-col gap-4">
            <RelationPicker label="Experiences" searchType="experience" value={experiences} onChange={setExperiences} />
            <RelationPicker label="Food" searchType="food" value={foods} onChange={setFoods} />
          </div>
        </TabPanel>

        {mode === "edit" && initial && (
          <TabPanel value="media">
            <MediaEditor contentType="DESTINATION" contentId={initial.id} media={initial.media} onAdd={addDestinationMediaAction} onDelete={(mediaId) => deleteDestinationMediaAction(mediaId, initial.id)} />
          </TabPanel>
        )}

        <TabPanel value="taxonomy">
          <div className="flex max-w-xl flex-col gap-4">
            <RelationPicker label="Tags" searchType="tag" value={tags} onChange={setTags} />
          </div>
        </TabPanel>
      </Tabs>

      {error && <p role="alert" className="text-caption text-danger">{error}</p>}

      <div className="flex gap-2 border-t border-border pt-4">
        <Button onClick={handleSave} loading={saving} disabled={!name.trim() || !description.trim() || !location[0]}>
          {mode === "create" ? "Create destination" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function MonthSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
      <option value="">—</option>
      {MONTHS.map((m, i) => (
        <option key={m} value={i + 1}>
          {m}
        </option>
      ))}
    </select>
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
