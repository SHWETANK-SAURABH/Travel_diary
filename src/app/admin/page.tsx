import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/features/admin/service";
import { Card, CardContent } from "@/components/ui";

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <div className="rounded-md border border-border p-4">
      <p className="text-label font-medium tracking-wide text-ink-muted uppercase">{label}</p>
      <p className="mt-1 text-h2 font-display text-ink">{value.toLocaleString("en-IN")}</p>
    </div>
  );
  return href ? (
    <Link href={href} className="block transition-shadow duration-base hover:shadow-panel">
      {inner}
    </Link>
  ) : (
    inner
  );
}

/** Real counts + "needs attention" queues (spec §6/§7), not vanity metrics — every number here links straight to the list that explains it. */
export default async function AdminDashboardPage() {
  const session = await auth();
  const stats = await getDashboardStats(session);

  const attentionItems = [
    { label: "Festivals missing dates", value: stats.needsAttention.festivalsMissingDates, href: "/admin/verification" },
    { label: "Festivals with uncertain dates", value: stats.needsAttention.festivalsExpectedDates, href: "/admin/verification" },
    { label: "Destinations unverified", value: stats.needsAttention.destinationsUnverified, href: "/admin/verification" },
    { label: "Festivals missing images", value: stats.needsAttention.festivalsMissingImages, href: "/admin/verification" },
    { label: "Destinations missing images", value: stats.needsAttention.destinationsMissingImages, href: "/admin/verification" },
    { label: "Festivals needing re-review", value: stats.needsAttention.staleFestivals, href: "/admin/verification" },
  ].filter((item) => item.value > 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-h1">Dashboard</h1>
        <p className="mt-1 text-ink-muted">Signed in as {session?.user.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Festivals" value={stats.totals.festivals} href="/admin/festivals" />
        <StatCard label="Destinations" value={stats.totals.destinations} href="/admin/destinations" />
        <StatCard label="Experiences" value={stats.totals.experiences} href="/admin/experiences" />
        <StatCard label="Food" value={stats.totals.food} href="/admin/food" />
      </div>

      <div>
        <h2 className="font-display text-h3">Needs attention</h2>
        {attentionItems.length === 0 ? (
          <p className="mt-2 text-caption text-ink-muted">Nothing needs review right now.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {attentionItems.map((item) => (
              <StatCard key={item.label} label={item.label} value={item.value} href={item.href} />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-h3">Recent activity</h2>
          <Link href="/admin/audit" className="text-caption text-marigold-600 hover:underline">
            View audit log
          </Link>
        </div>
        {stats.recentActivity.length === 0 ? (
          <p className="mt-2 text-caption text-ink-muted">No admin activity yet.</p>
        ) : (
          <Card variant="compact" className="mt-3">
            <CardContent className="divide-y divide-border p-0">
              {stats.recentActivity.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-ink">
                    <span className="font-medium">{entry.admin.name ?? entry.admin.email}</span> {entry.action.replace(/_/g, " ")} {entry.entityType.toLowerCase().replace(/_/g, " ")}
                    {entry.entityLabel ? ` — ${entry.entityLabel}` : ""}
                  </span>
                  <span className="shrink-0 text-caption text-ink-muted">{entry.createdAt.toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
