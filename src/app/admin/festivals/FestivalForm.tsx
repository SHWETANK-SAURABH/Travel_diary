"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { RelationPicker, type RelationOption } from "@/components/admin/RelationPicker";
import { ContentStatusPill, VerificationPill, DateConfidencePill } from "@/components/admin/StatusPill";
import { createFestivalAction, updateFestivalAction, saveFestivalOccurrenceAction, setFestivalVerificationAction, addFestivalMediaAction, deleteFestivalMediaAction } from "./actions";

interface CategoryOption {
  id: string;
  name: string;
}

export interface FestivalFormInitial {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  popularity: "POPULAR" | "HIDDEN" | "LOCAL_EMERGING";
  featured: boolean;
  locationId: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  precision: "EXACT" | "APPROXIMATE";
  recurrenceType: "ANNUAL_FIXED_DATE" | "ANNUAL_LUNAR_OR_REGIONAL_CALENDAR" | "ANNUAL_VARIABLE" | "ONE_TIME" | "IRREGULAR";
  recurrenceNotes: string | null;
  typicalDurationDays: number | null;
  verificationStatus: "UNVERIFIED" | "AI_GENERATED" | "ADMIN_VERIFIED" | "ADMIN_OVERRIDDEN";
  verificationSource: string | null;
  lastVerifiedAt: Date | null;
  tags: RelationOption[];
  travellerFitTags: RelationOption[];
  destinations: RelationOption[];
  experiences: RelationOption[];
  foods: RelationOption[];
  occurrences: { id: string; year: number; startDate: Date | null; endDate: Date | null; dateConfidence: string; source: string | null; notes: string | null }[];
  media: { id: string; url: string; altText: string | null; order: number }[];
}

function toDateInput(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

export function FestivalForm({ mode, categories, initial }: { mode: "create" | "edit"; categories: CategoryOption[]; initial?: FestivalFormInitial }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [popularity, setPopularity] = useState(initial?.popularity ?? "LOCAL_EMERGING");
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const [location, setLocation] = useState<RelationOption[]>(initial ? [{ id: initial.locationId, name: initial.locationName }] : []);
  const [latitude, setLatitude] = useState(initial?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(initial?.longitude?.toString() ?? "");
  const [precision, setPrecision] = useState(initial?.precision ?? "APPROXIMATE");

  const [recurrenceType, setRecurrenceType] = useState(initial?.recurrenceType ?? "ANNUAL_VARIABLE");
  const [recurrenceNotes, setRecurrenceNotes] = useState(initial?.recurrenceNotes ?? "");
  const [typicalDurationDays, setTypicalDurationDays] = useState(initial?.typicalDurationDays?.toString() ?? "");
  const [destinations, setDestinations] = useState<RelationOption[]>(initial?.destinations ?? []);
  const [experiences, setExperiences] = useState<RelationOption[]>(initial?.experiences ?? []);
  const [foods, setFoods] = useState<RelationOption[]>(initial?.foods ?? []);

  const [tags, setTags] = useState<RelationOption[]>(initial?.tags ?? []);
  const [travellerFitTags, setTravellerFitTags] = useState<RelationOption[]>(initial?.travellerFitTags ?? []);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const input = {
      name,
      slug: slug || undefined,
      description,
      categoryId,
      status,
      popularity,
      featured,
      locationId: location[0]?.id,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      precision,
      recurrenceType,
      recurrenceNotes: recurrenceNotes || undefined,
      typicalDurationDays: typicalDurationDays ? Number(typicalDurationDays) : undefined,
      tagIds: tags.map((t) => t.id),
      travellerFitTagIds: travellerFitTags.map((t) => t.id),
      destinationIds: destinations.map((d) => d.id),
      experienceIds: experiences.map((d) => d.id),
      foodIds: foods.map((d) => d.id),
    };

    const result = mode === "create" ? await createFestivalAction(input) : await updateFestivalAction(initial!.id, input);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (mode === "create") {
      router.push(`/admin/festivals/${result.data.id}`);
    } else {
      router.refresh();
    }
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
          {mode === "edit" && <Tab value="dates">Dates</Tab>}
          <Tab value="content">Content</Tab>
          {mode === "edit" && <Tab value="media">Media</Tab>}
          <Tab value="taxonomy">Taxonomy</Tab>
          {mode === "edit" && <Tab value="verification">Verification</Tab>}
        </TabList>

        <TabPanel value="basic">
          <div className="flex max-w-xl flex-col gap-4">
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Slug" hint="Leave blank to derive from name">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={name ? `e.g. ${name.toLowerCase().replace(/\s+/g, "-")}` : undefined} />
            </Field>
            <Field label="Description">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-40" />
            </Field>
            <Field label="Category">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
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
              <Field label="Popularity">
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

        {mode === "edit" && initial && (
          <TabPanel value="dates">
            <OccurrencesEditor festivalId={initial.id} occurrences={initial.occurrences} />
          </TabPanel>
        )}

        <TabPanel value="content">
          <div className="flex max-w-xl flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Recurrence">
                <select value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value as typeof recurrenceType)} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
                  <option value="ANNUAL_FIXED_DATE">Annual — fixed date</option>
                  <option value="ANNUAL_LUNAR_OR_REGIONAL_CALENDAR">Annual — lunar/regional calendar</option>
                  <option value="ANNUAL_VARIABLE">Annual — variable</option>
                  <option value="ONE_TIME">One-time</option>
                  <option value="IRREGULAR">Irregular</option>
                </select>
              </Field>
              <Field label="Typical duration (days)">
                <Input type="number" min={1} value={typicalDurationDays} onChange={(e) => setTypicalDurationDays(e.target.value)} />
              </Field>
            </div>
            <Field label="Recurrence notes">
              <Textarea value={recurrenceNotes} onChange={(e) => setRecurrenceNotes(e.target.value)} />
            </Field>
            <RelationPicker label="Destinations" searchType="destination" value={destinations} onChange={setDestinations} />
            <RelationPicker label="Experiences" searchType="experience" value={experiences} onChange={setExperiences} />
            <RelationPicker label="Food" searchType="food" value={foods} onChange={setFoods} />
          </div>
        </TabPanel>

        {mode === "edit" && initial && (
          <TabPanel value="media">
            <MediaEditor contentType="FESTIVAL" contentId={initial.id} media={initial.media} onAdd={addFestivalMediaAction} onDelete={(mediaId) => deleteFestivalMediaAction(mediaId, initial.id)} />
          </TabPanel>
        )}

        <TabPanel value="taxonomy">
          <div className="flex max-w-xl flex-col gap-4">
            <RelationPicker label="Tags" searchType="tag" value={tags} onChange={setTags} />
            <RelationPicker label="Traveller-fit tags" searchType="tag" value={travellerFitTags} onChange={setTravellerFitTags} />
          </div>
        </TabPanel>

        {mode === "edit" && initial && (
          <TabPanel value="verification">
            <VerificationEditor festivalId={initial.id} verificationStatus={initial.verificationStatus} verificationSource={initial.verificationSource} lastVerifiedAt={initial.lastVerifiedAt} />
          </TabPanel>
        )}
      </Tabs>

      {error && <p role="alert" className="text-caption text-danger">{error}</p>}

      <div className="flex gap-2 border-t border-border pt-4">
        <Button onClick={handleSave} loading={saving} disabled={!name.trim() || !description.trim() || !location[0]}>
          {mode === "create" ? "Create festival" : "Save changes"}
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

function OccurrencesEditor({ festivalId, occurrences }: { festivalId: string; occurrences: FestivalFormInitial["occurrences"] }) {
  const router = useRouter();
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateConfidence, setDateConfidence] = useState("EXPECTED");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setSaving(true);
    setError(null);
    const result = await saveFestivalOccurrenceAction(festivalId, {
      year,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      dateConfidence,
      source: source || undefined,
      notes: notes || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSource("");
    setNotes("");
    router.refresh();
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      {occurrences.length > 0 && (
        <div className="flex flex-col gap-2">
          {occurrences.map((occ) => (
            <div key={occ.id} className="rounded-md border border-border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{occ.year}</span>
                <DateConfidencePill confidence={occ.dateConfidence as "NOT_ANNOUNCED" | "AI_SUGGESTED" | "EXPECTED" | "CONFIRMED" | "ADMIN_VERIFIED"} />
              </div>
              <p className="mt-1 text-caption text-ink-muted">
                {occ.startDate ? toDateInput(occ.startDate) : "No start date"} – {occ.endDate ? toDateInput(occ.endDate) : "No end date"}
              </p>
              {occ.notes && <p className="mt-1 text-caption text-ink-muted italic">{occ.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-md border border-dashed border-border p-4">
        <p className="mb-3 text-sm font-medium text-ink">Add / update a year&apos;s dates</p>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Year">
              <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
            </Field>
            <Field label="Date status">
              <select value={dateConfidence} onChange={(e) => setDateConfidence(e.target.value)} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
                <option value="NOT_ANNOUNCED">Not announced</option>
                <option value="AI_SUGGESTED">AI-suggested</option>
                <option value="EXPECTED">Expected</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="ADMIN_VERIFIED">Admin-verified</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="End date">
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
          <Field label="Source">
            <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. State tourism board" />
          </Field>
          <Field label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          {error && <p role="alert" className="text-caption text-danger">{error}</p>}
          <Button size="sm" onClick={handleAdd} loading={saving} className="self-start">
            Save dates
          </Button>
        </div>
      </div>
    </div>
  );
}

function VerificationEditor({
  festivalId,
  verificationStatus,
  verificationSource,
  lastVerifiedAt,
}: {
  festivalId: string;
  verificationStatus: string;
  verificationSource: string | null;
  lastVerifiedAt: Date | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(verificationStatus);
  const [source, setSource] = useState(verificationSource ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await setFestivalVerificationAction(festivalId, { verificationStatus: status, verificationSource: source || undefined });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <p className="text-caption text-ink-muted">{lastVerifiedAt ? `Last verified ${lastVerifiedAt.toLocaleDateString("en-IN")}` : "Never verified."} This information is internal — never shown publicly.</p>
      <Field label="Verification status">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 w-64 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
          <option value="UNVERIFIED">Unverified</option>
          <option value="AI_GENERATED">AI-generated</option>
          <option value="ADMIN_VERIFIED">Admin-verified</option>
          <option value="ADMIN_OVERRIDDEN">Admin-overridden</option>
        </select>
      </Field>
      <Field label="Source">
        <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Called tourism office, Aug 2026" />
      </Field>
      {error && <p role="alert" className="text-caption text-danger">{error}</p>}
      <Button size="sm" onClick={handleSave} loading={saving} className="self-start">
        Update verification
      </Button>
    </div>
  );
}

export function MediaEditor({
  contentType,
  contentId,
  media,
  onAdd,
  onDelete,
}: {
  contentType: "FESTIVAL" | "DESTINATION" | "EXPERIENCE" | "FOOD" | "EVENT";
  contentId: string;
  media: { id: string; url: string; altText: string | null; order: number }[];
  onAdd: (input: unknown) => Promise<{ ok: boolean; error?: string }>;
  onDelete: (mediaId: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [order, setOrder] = useState(media.length);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setSaving(true);
    setError(null);
    const result = await onAdd({ url, altText: altText || undefined, order, contentType, contentId });
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Couldn't add media");
      return;
    }
    setUrl("");
    setAltText("");
    router.refresh();
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {media
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <div key={item.id} className="overflow-hidden rounded-md border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an arbitrary external URL; next/image would need every possible host allow-listed */}
                <img src={item.url} alt={item.altText ?? ""} className="h-24 w-full object-cover" />
                <div className="p-2">
                  <p className="truncate text-caption text-ink-muted">{item.altText || "No alt text"}</p>
                  <button
                    type="button"
                    onClick={async () => {
                      await onDelete(item.id);
                      router.refresh();
                    }}
                    className="mt-1 text-caption text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="rounded-md border border-dashed border-border p-4">
        <p className="mb-3 text-sm font-medium text-ink">Add image by URL</p>
        <p className="mb-3 text-caption text-ink-muted">No file upload is configured in this environment — paste a hosted image URL (see docs/architecture.md).</p>
        <div className="flex flex-col gap-3">
          <Field label="Image URL">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="Alt text" hint="Describe the image — never the filename">
            <Input value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="e.g. Dancers in traditional attire at the opening ceremony" />
          </Field>
          <Field label="Order">
            <Input type="number" min={0} value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-24" />
          </Field>
          {error && <p role="alert" className="text-caption text-danger">{error}</p>}
          <Button size="sm" onClick={handleAdd} loading={saving} disabled={!url.trim()} className="self-start">
            Add image
          </Button>
        </div>
      </div>
    </div>
  );
}
