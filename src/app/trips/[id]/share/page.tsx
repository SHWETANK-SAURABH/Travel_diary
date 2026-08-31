import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getSharedTrip, resolveTripItems, estimateTripBudget } from "@/features/trips/service";
import { Container } from "@/components/layout";
import { BudgetEstimate, TripMap } from "@/components/trips";
import { ResponsiveImage } from "@/components/ui";
import { CONTENT_TYPE_LABEL } from "@/components/discovery/contentKind";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const trip = await getSharedTrip(id);
  return {
    title: trip ? `${trip.name} — Shared trip` : "Trip",
    // A personal itinerary is never a search-indexing target, PUBLIC or not — there's no public trip directory this would surface in.
    robots: { index: false },
  };
}

/**
 * Public, read-only itinerary (spec §37/§38) — no auth, no owner-only
 * controls (no remove/reorder/edit), no private data beyond what the owner
 * chose to put in the itinerary itself. Items whose content has since been
 * deleted are silently skipped rather than shown as "no longer available"
 * (that message is useful to the owner while editing, not to a stranger
 * viewing the trip).
 */
export default async function TripSharePage({ params }: SharePageProps) {
  const { id } = await params;
  const trip = await getSharedTrip(id);
  if (!trip) notFound();

  const [items, budget] = await Promise.all([resolveTripItems(trip.items), estimateTripBudget(trip)]);
  const availableItems = items.filter((i) => i.content != null);

  const dayCount = Math.max(trip.days ?? 1, ...availableItems.map((i) => i.day), 1);
  const dayNumbers = Array.from({ length: dayCount }, (_, i) => i + 1);
  const mapPoints = availableItems
    .filter((i) => i.content!.latitude != null && i.content!.longitude != null)
    .map((i) => ({ id: i.id, name: i.content!.name, day: i.day, latitude: i.content!.latitude!, longitude: i.content!.longitude! }));

  return (
    <Container className="py-12">
      <div className="flex flex-col gap-1">
        <p className="text-label font-medium tracking-wide text-marigold-600 uppercase">Shared trip</p>
        <h1 className="text-h1 font-display">{trip.name}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-muted">
          {trip.location?.name && <span>{trip.location.name}</span>}
          {trip.startDate && (
            <span>
              {trip.startDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
              {trip.endDate ? ` – ${trip.endDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}` : ""}
            </span>
          )}
          {trip.travellerCount && (
            <span>
              {trip.travellerCount} traveller{trip.travellerCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <BudgetEstimate estimate={budget} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6 lg:order-1">
          {dayNumbers.map((day) => {
            const dayItems = availableItems.filter((i) => i.day === day).sort((a, b) => a.order - b.order);
            if (dayItems.length === 0) return null;
            return (
              <div key={day}>
                <h2 className="text-h3 font-display">Day {day}</h2>
                <div className="mt-2 flex flex-col gap-2">
                  {dayItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-md border border-border p-3">
                      {item.content!.imageUrl ? (
                        <ResponsiveImage src={item.content!.imageUrl} alt="" aspectRatio="1/1" containerClassName="h-14 w-14 shrink-0 rounded-md" className="rounded-md" sizes="56px" />
                      ) : (
                        <div className="h-14 w-14 shrink-0 rounded-md bg-marigold-50" aria-hidden="true" />
                      )}
                      <div className="min-w-0">
                        {item.content!.href ? (
                          <Link href={item.content!.href} className="block truncate text-sm font-medium text-ink hover:text-marigold-600">
                            {item.content!.name}
                          </Link>
                        ) : (
                          <p className="truncate text-sm font-medium text-ink">{item.content!.name}</p>
                        )}
                        <p className="truncate text-caption text-ink-muted">
                          {CONTENT_TYPE_LABEL[item.content!.contentType]}
                          {item.content!.locationName ? ` · ${item.content!.locationName}` : ""}
                        </p>
                        {item.notes && <p className="mt-1 truncate text-caption text-ink-muted italic">{item.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {availableItems.length === 0 && <p className="text-caption text-ink-muted">This trip doesn&apos;t have any stops yet.</p>}
        </div>

        <div className="h-80 overflow-hidden rounded-lg border border-border lg:sticky lg:top-20 lg:order-2 lg:h-[calc(100vh-6rem)]">
          <TripMap points={mapPoints} />
        </div>
      </div>

      <p className="mt-8 text-caption text-ink-muted">
        Want to plan your own trip?{" "}
        <Link href="/trips/new" className="text-marigold-600 hover:underline">
          Start a TravelDiary trip
        </Link>
        .
      </p>
    </Container>
  );
}
