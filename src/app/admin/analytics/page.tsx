import Link from "next/link";
import { auth } from "@/lib/auth";
import { getAdminAnalytics, type DateRangeKey } from "@/features/analytics/admin-service";
import { getContentOpportunities } from "@/features/analytics/content-intelligence";
import { ActivityLineChart } from "@/components/admin/charts/ActivityLineChart";
import { ContentOpportunities } from "./ContentOpportunities";

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

const RANGE_LABEL: Record<DateRangeKey, string> = { today: "Today", "7d": "7 days", "30d": "30 days", "90d": "90 days" };
const RANGES: DateRangeKey[] = ["today", "7d", "30d", "90d"];

function StatTile({ label, comparison }: { label: string; comparison: { current: number; previous: number; changePercent: number | null } }) {
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-label font-medium tracking-wide text-ink-muted uppercase">{label}</p>
      <p className="mt-1 text-h2 font-display text-ink">{comparison.current.toLocaleString("en-IN")}</p>
      <p className="text-caption text-ink-muted">
        {comparison.changePercent != null ? (
          <span className={comparison.changePercent >= 0 ? "text-success" : "text-danger"}>
            {comparison.changePercent >= 0 ? "+" : ""}
            {comparison.changePercent}%
          </span>
        ) : (
          <span>vs {comparison.previous} prior</span>
        )}{" "}
        <span>· prior period: {comparison.previous.toLocaleString("en-IN")}</span>
      </p>
    </div>
  );
}

function ContentTable({ items }: { items: { id: string; name: string; href: string | null; views: number }[] }) {
  if (items.length === 0) return <p className="text-caption text-ink-muted">No views in this range yet.</p>;
  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-marigold-50/40">
          {item.href ? (
            <Link href={item.href} target="_blank" className="truncate text-ink hover:text-marigold-600">
              {item.name}
            </Link>
          ) : (
            <span className="truncate text-ink">{item.name}</span>
          )}
          <span className="shrink-0 text-caption text-ink-muted">{item.views} views</span>
        </div>
      ))}
    </div>
  );
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const { range: rangeParam } = await searchParams;
  const range: DateRangeKey = RANGES.includes(rangeParam as DateRangeKey) ? (rangeParam as DateRangeKey) : "30d";

  const session = await auth();
  const [data, opportunities] = await Promise.all([getAdminAnalytics(session, range), getContentOpportunities(session)]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h1">Analytics</h1>
        <div className="flex gap-1 rounded-md border border-border p-1">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/analytics?range=${r}`}
              className={`rounded px-3 py-1 text-caption ${r === range ? "bg-marigold-500 text-white" : "text-ink hover:bg-marigold-50"}`}
            >
              {RANGE_LABEL[r]}
            </Link>
          ))}
        </div>
      </div>

      {/* Overview */}
      <div>
        <h2 className="font-display text-h3">Overview</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Content views" comparison={data.overview.contentViews} />
          <StatTile label="Searches" comparison={data.overview.searches} />
          <StatTile label="Saves" comparison={data.overview.saves} />
          <StatTile label="Trips created" comparison={data.overview.tripsCreated} />
        </div>
      </div>

      {/* Activity over time */}
      <div>
        <h2 className="font-display text-h3">Activity over time</h2>
        <div className="mt-3 rounded-md border border-border p-4">
          <ActivityLineChart data={data.activity} />
        </div>
      </div>

      {/* Discovery */}
      <div>
        <h2 className="font-display text-h3">Discovery</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border p-4">
            <p className="mb-2 text-sm font-medium text-ink">Top festivals</p>
            <ContentTable items={data.topFestivals} />
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="mb-2 text-sm font-medium text-ink">Top destinations</p>
            <ContentTable items={data.topDestinations} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div>
        <h2 className="font-display text-h3">Search</h2>
        <div className="mt-3 overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-paper-raised text-left text-label font-medium tracking-wide text-ink-muted uppercase">
                <th className="px-3 py-2">Query</th>
                <th className="px-3 py-2">Searches</th>
                <th className="px-3 py-2">Zero-result</th>
              </tr>
            </thead>
            <tbody>
              {data.topSearches.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-caption text-ink-muted">
                    No searches in this range yet.
                  </td>
                </tr>
              ) : (
                data.topSearches.map((row) => (
                  <tr key={row.query} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-ink">{row.query}</td>
                    <td className="px-3 py-2 text-ink-muted">{row.count}</td>
                    <td className="px-3 py-2 text-ink-muted">{row.zeroResultCount > 0 ? <span className="text-terracotta-500">{row.zeroResultCount}</span> : "0"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Content opportunities */}
      <div>
        <h2 className="font-display text-h3">Content opportunities</h2>
        <p className="text-caption text-ink-muted">Repeated searches that found nothing, over the last 90 days — a signal for what to add next, not an automatic action.</p>
        <div className="mt-3">
          <ContentOpportunities opportunities={opportunities} />
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="font-display text-h3">Recommendations</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-border p-4">
            <p className="text-label font-medium tracking-wide text-ink-muted uppercase">Impressions</p>
            <p className="mt-1 text-h3 font-display text-ink">{data.recommendations.impressions}</p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-label font-medium tracking-wide text-ink-muted uppercase">Clicks</p>
            <p className="mt-1 text-h3 font-display text-ink">{data.recommendations.clicks}</p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-label font-medium tracking-wide text-ink-muted uppercase">Saved</p>
            <p className="mt-1 text-h3 font-display text-ink">{data.recommendations.saves}</p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-label font-medium tracking-wide text-ink-muted uppercase">Added to trip</p>
            <p className="mt-1 text-h3 font-display text-ink">{data.recommendations.addedToTrip}</p>
          </div>
        </div>
      </div>

      {/* Trips */}
      <div>
        <h2 className="font-display text-h3">Trips</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-border p-4">
            <p className="text-label font-medium tracking-wide text-ink-muted uppercase">Created</p>
            <p className="mt-1 text-h3 font-display text-ink">{data.trips.created}</p>
            <p className="mt-2 text-caption text-ink-muted">Avg {data.trips.averageItemCount} items/trip · {data.trips.publicShares} shared</p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="mb-2 text-sm font-medium text-ink">Most-added destinations</p>
            {data.trips.topDestinations.length === 0 ? (
              <p className="text-caption text-ink-muted">None yet.</p>
            ) : (
              data.trips.topDestinations.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <span className="truncate text-ink">{d.name}</span>
                  <span className="text-caption text-ink-muted">{d.count}</span>
                </div>
              ))
            )}
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="mb-2 text-sm font-medium text-ink">Most-added festivals</p>
            {data.trips.topFestivals.length === 0 ? (
              <p className="text-caption text-ink-muted">None yet.</p>
            ) : (
              data.trips.topFestivals.map((f) => (
                <div key={f.name} className="flex items-center justify-between text-sm">
                  <span className="truncate text-ink">{f.name}</span>
                  <span className="text-caption text-ink-muted">{f.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System health */}
      <div>
        <h2 className="font-display text-h3">System health</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-border p-4">
            <p className="text-label font-medium tracking-wide text-ink-muted uppercase">Database</p>
            <p className={`mt-1 text-h3 font-display ${data.health.database === "healthy" ? "text-success" : "text-danger"}`}>{data.health.database === "healthy" ? "Healthy" : "Unhealthy"}</p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-label font-medium tracking-wide text-ink-muted uppercase">Errors (24h)</p>
            <p className={`mt-1 text-h3 font-display ${data.health.recentErrorCount === 0 ? "text-ink" : "text-danger"}`}>{data.health.recentErrorCount}</p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-label font-medium tracking-wide text-ink-muted uppercase">Slow requests (24h)</p>
            <p className="mt-1 text-h3 font-display text-ink">{data.health.slowRequestCount}</p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-label font-medium tracking-wide text-ink-muted uppercase">Avg latency</p>
            <p className="mt-1 text-h3 font-display text-ink">
              {data.health.avgSearchLatencyMs != null ? `${data.health.avgSearchLatencyMs}ms search` : "—"}
            </p>
            <p className="text-caption text-ink-muted">{data.health.avgMapLatencyMs != null ? `${data.health.avgMapLatencyMs}ms map` : "No map data yet"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
