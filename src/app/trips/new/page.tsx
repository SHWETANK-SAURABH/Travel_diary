"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { useGuestStore } from "@/lib/guest/store";
import { trackClientEvent } from "@/lib/analytics/client";

/** Minimum fields only (spec §8): name, optional dates, optional budget/travellers — no region picker, no mandatory fields beyond a name. */
export default function NewTripPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const guestCreateTrip = useGuestStore((s) => s.createTrip);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travellerCount, setTravellerCount] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (startDate && endDate && endDate < startDate) {
      setError("End date can't be before the start date.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const input = {
      name: trimmedName,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      travellerCount: travellerCount ? Number(travellerCount) : undefined,
      estimatedBudget: estimatedBudget ? Number(estimatedBudget) : undefined,
    };

    try {
      if (session) {
        const res = await fetch("/api/trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error("Failed to create trip");
        const data = (await res.json()) as { trip: { id: string } };
        trackClientEvent({ type: "TRIP_CREATED", contentId: data.trip.id });
        router.push(`/trips/${data.trip.id}`);
      } else {
        const localId = guestCreateTrip(input);
        trackClientEvent({ type: "TRIP_CREATED", contentId: localId, metadata: { guest: true } });
        router.push(`/trips/${localId}`);
      }
    } catch {
      setError("Couldn't create your trip — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Container className="py-12">
      <h1 className="font-display text-h1">Plan a new trip</h1>
      <p className="mt-2 max-w-sm text-ink-muted">Just a name to start — you can add dates, a budget, and stops as you go.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-sm flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink">
          Trip name
          <Input required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kerala October" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm text-ink">
            Start date
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            End date
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm text-ink">
            Travellers
            <Input type="number" min={1} value={travellerCount} onChange={(e) => setTravellerCount(e.target.value)} placeholder="Optional" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Budget (₹)
            <Input type="number" min={0} value={estimatedBudget} onChange={(e) => setEstimatedBudget(e.target.value)} placeholder="Optional" />
          </label>
        </div>

        {error && (
          <p role="alert" className="text-caption text-danger">
            {error}
          </p>
        )}

        <Button type="submit" loading={submitting} disabled={!name.trim()}>
          Create trip
        </Button>
      </form>
    </Container>
  );
}
