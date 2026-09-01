"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea } from "@/components/ui";
import { RelationPicker, type RelationOption } from "@/components/admin/RelationPicker";
import { createLocationAction, updateLocationAction, deleteLocationAction } from "./actions";

export interface LocationFormInitial {
  id: string;
  type: "COUNTRY" | "STATE" | "REGION" | "CITY";
  name: string;
  slug: string;
  parentId: string | null;
  parentName: string | null;
  latitude: number | null;
  longitude: number | null;
  precision: "EXACT" | "APPROXIMATE";
  nearestAirport: string | null;
  nearestRailwayStation: string | null;
  roadAccessNotes: string | null;
  localTransportNotes: string | null;
  accommodationNotes: string | null;
  childCount: number;
}

/** No polygon/geometry editing here (spec §19: "do not let admins manually edit geographic boundary geometry through a normal text field") — just labels, hierarchy, point coordinates, and metadata. */
export function LocationForm({ mode, initial }: { mode: "create" | "edit"; initial?: LocationFormInitial }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState(initial?.type ?? "CITY");
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [parent, setParent] = useState<RelationOption[]>(initial?.parentId ? [{ id: initial.parentId, name: initial.parentName ?? "" }] : []);
  const [latitude, setLatitude] = useState(initial?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(initial?.longitude?.toString() ?? "");
  const [precision, setPrecision] = useState(initial?.precision ?? "APPROXIMATE");
  const [nearestAirport, setNearestAirport] = useState(initial?.nearestAirport ?? "");
  const [nearestRailwayStation, setNearestRailwayStation] = useState(initial?.nearestRailwayStation ?? "");
  const [roadAccessNotes, setRoadAccessNotes] = useState(initial?.roadAccessNotes ?? "");
  const [localTransportNotes, setLocalTransportNotes] = useState(initial?.localTransportNotes ?? "");
  const [accommodationNotes, setAccommodationNotes] = useState(initial?.accommodationNotes ?? "");

  async function handleSave() {
    setSaving(true);
    setError(null);
    const input = {
      type,
      name,
      slug: slug || undefined,
      parentId: parent[0]?.id,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      precision,
      nearestAirport: nearestAirport || undefined,
      nearestRailwayStation: nearestRailwayStation || undefined,
      roadAccessNotes: roadAccessNotes || undefined,
      localTransportNotes: localTransportNotes || undefined,
      accommodationNotes: accommodationNotes || undefined,
    };
    const result = mode === "create" ? await createLocationAction(input) : await updateLocationAction(initial!.id, input);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (mode === "create") router.push(`/admin/locations/${result.data.id}`);
    else router.refresh();
  }

  async function handleDelete() {
    if (!initial) return;
    if (!confirm(`Delete "${initial.name}"? This can't be undone.`)) return;
    setDeleting(true);
    const result = await deleteLocationAction(initial.id);
    if (result && !result.ok) {
      setDeleting(false);
      setError(result.error);
    }
    // On success the action itself redirects — nothing more to do here.
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="h-10 rounded-md border border-border bg-paper-raised px-3 text-sm text-ink">
            <option value="COUNTRY">Country</option>
            <option value="STATE">State</option>
            <option value="REGION">Region</option>
            <option value="CITY">City</option>
          </select>
        </Field>
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
      </div>
      <Field label="Slug" hint="Leave blank to derive from name">
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
      </Field>
      <RelationPicker label="Parent location" searchType="location" value={parent} onChange={setParent} single placeholder="Search states, regions… (optional)" />
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
      <Field label="Nearest airport">
        <Input value={nearestAirport} onChange={(e) => setNearestAirport(e.target.value)} />
      </Field>
      <Field label="Nearest railway station">
        <Input value={nearestRailwayStation} onChange={(e) => setNearestRailwayStation(e.target.value)} />
      </Field>
      <Field label="Road access notes">
        <Textarea value={roadAccessNotes} onChange={(e) => setRoadAccessNotes(e.target.value)} />
      </Field>
      <Field label="Local transport notes">
        <Textarea value={localTransportNotes} onChange={(e) => setLocalTransportNotes(e.target.value)} />
      </Field>
      <Field label="Accommodation notes">
        <Textarea value={accommodationNotes} onChange={(e) => setAccommodationNotes(e.target.value)} />
      </Field>

      {error && <p role="alert" className="text-caption text-danger">{error}</p>}
      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button onClick={handleSave} loading={saving} disabled={!name.trim()}>
          {mode === "create" ? "Create location" : "Save changes"}
        </Button>
        {mode === "edit" && initial && (
          <Button variant="outline" onClick={handleDelete} loading={deleting} disabled={initial.childCount > 0}>
            {initial.childCount > 0 ? `Delete (has ${initial.childCount} sub-locations)` : "Delete"}
          </Button>
        )}
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
