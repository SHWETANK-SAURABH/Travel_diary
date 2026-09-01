"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ContentOpportunity } from "@/features/analytics/content-intelligence";
import { dismissContentOpportunityAction } from "./actions";

/** Spec §12/§47: view / search existing content / create content / dismiss, per opportunity — never auto-creates anything, the admin always decides. */
export function ContentOpportunities({ opportunities }: { opportunities: ContentOpportunity[] }) {
  const router = useRouter();
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDismiss(normalizedQuery: string) {
    setDismissing(normalizedQuery);
    startTransition(async () => {
      await dismissContentOpportunityAction(normalizedQuery);
      router.refresh();
      setDismissing(null);
    });
  }

  if (opportunities.length === 0) {
    return <p className="text-caption text-ink-muted">No repeated zero-result searches in this range — nothing worth flagging as a content gap yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-paper-raised text-left text-label font-medium tracking-wide text-ink-muted uppercase">
            <th className="px-3 py-2">Query</th>
            <th className="px-3 py-2">Searches (30d / 90d)</th>
            <th className="px-3 py-2">Last searched</th>
            <th className="px-3 py-2">Score</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((o) => (
            <tr key={o.normalizedQuery} className="border-b border-border last:border-0 hover:bg-marigold-50/40">
              <td className="px-3 py-2.5 font-medium text-ink">{o.sampleRawQuery}</td>
              <td className="px-3 py-2.5 text-ink-muted">
                {o.recentSearches} / {o.totalSearches}
              </td>
              <td className="px-3 py-2.5 text-ink-muted">{new Date(o.lastSearchedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</td>
              <td className="px-3 py-2.5 text-ink-muted">{o.score}</td>
              <td className="px-3 py-2.5">
                <div className="flex flex-wrap gap-2 text-caption">
                  <Link href={`/admin/festivals?q=${encodeURIComponent(o.sampleRawQuery)}`} className="text-marigold-600 hover:underline">
                    Search festivals
                  </Link>
                  <Link href={`/admin/destinations?q=${encodeURIComponent(o.sampleRawQuery)}`} className="text-marigold-600 hover:underline">
                    Search destinations
                  </Link>
                  <Link href="/admin/festivals/new" className="text-marigold-600 hover:underline">
                    Create festival
                  </Link>
                  <Link href="/admin/destinations/new" className="text-marigold-600 hover:underline">
                    Create destination
                  </Link>
                  <button type="button" onClick={() => handleDismiss(o.normalizedQuery)} disabled={pending && dismissing === o.normalizedQuery} className="text-danger hover:underline disabled:opacity-50">
                    Dismiss
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
