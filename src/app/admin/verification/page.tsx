import Link from "next/link";
import { auth } from "@/lib/auth";
import { getVerificationQueue } from "@/features/admin/verification";
import { DateConfidencePill } from "@/components/admin/StatusPill";

interface QueueItem {
  id: string;
  slug: string;
  name: string;
}

function QueueSection({ title, description, items, href, render }: { title: string; description: string; items: QueueItem[]; href: (item: QueueItem) => string; render?: (item: QueueItem) => React.ReactNode }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-h3">
        {title} <span className="text-caption font-normal text-ink-muted">({items.length})</span>
      </h2>
      <p className="text-caption text-ink-muted">{description}</p>
      <div className="mt-3 flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            <Link href={href(item)} className="text-ink hover:text-marigold-600">
              {item.name}
            </Link>
            {render?.(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Spec §33/§34: every row here is an explainable query against fields that already exist, and every item links straight to its edit page — "needs review," never a false "incorrect" claim. */
export default async function AdminVerificationPage() {
  const session = await auth();
  const queue = await getVerificationQueue(session);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-h1">Verification</h1>
        <p className="mt-1 text-ink-muted">Content that needs a human look — dates, verification status, and images, all sourced from live data.</p>
      </div>

      <QueueSection title="Festivals missing dates" description="No occurrence has been added yet." items={queue.festivalsMissingDates} href={(i) => `/admin/festivals/${i.id}`} />

      <QueueSection
        title="Festivals with uncertain dates"
        description="Latest date is not yet confirmed."
        items={queue.festivalsUncertainDates}
        href={(i) => `/admin/festivals/${i.id}`}
        render={(i) => {
          const item = queue.festivalsUncertainDates.find((f) => f.id === i.id);
          const latest = item?.occurrences[0];
          return latest ? <DateConfidencePill confidence={latest.dateConfidence} /> : null;
        }}
      />

      <QueueSection title="Destinations unverified" description="Verification status has never been set." items={queue.destinationsUnverified} href={(i) => `/admin/destinations/${i.id}`} />

      <QueueSection title="Festivals missing images" description="No media attached yet." items={queue.festivalsMissingImages} href={(i) => `/admin/festivals/${i.id}`} />

      <QueueSection title="Destinations missing images" description="No media attached yet." items={queue.destinationsMissingImages} href={(i) => `/admin/destinations/${i.id}`} />

      <QueueSection
        title="Festivals needing re-review"
        description="Never verified, or not verified in the last 180 days."
        items={queue.staleFestivals}
        href={(i) => `/admin/festivals/${i.id}`}
        render={(i) => {
          const item = queue.staleFestivals.find((f) => f.id === i.id);
          return <span className="text-caption text-ink-muted">{item?.lastVerifiedAt ? `Last verified ${item.lastVerifiedAt.toLocaleDateString("en-IN")}` : "Never verified"}</span>;
        }}
      />

      <QueueSection
        title="Destinations needing re-review"
        description="Never verified, or not verified in the last 180 days."
        items={queue.staleDestinations}
        href={(i) => `/admin/destinations/${i.id}`}
        render={(i) => {
          const item = queue.staleDestinations.find((d) => d.id === i.id);
          return <span className="text-caption text-ink-muted">{item?.lastVerifiedAt ? `Last verified ${item.lastVerifiedAt.toLocaleDateString("en-IN")}` : "Never verified"}</span>;
        }}
      />

      {[queue.festivalsMissingDates, queue.festivalsUncertainDates, queue.destinationsUnverified, queue.festivalsMissingImages, queue.destinationsMissingImages, queue.staleFestivals, queue.staleDestinations].every(
        (list) => list.length === 0
      ) && <p className="text-ink-muted">Nothing needs review right now.</p>}
    </div>
  );
}
