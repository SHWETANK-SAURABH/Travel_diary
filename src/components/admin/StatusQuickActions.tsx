"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type StatusAction = (id: string, status: ContentStatus) => Promise<{ ok: boolean; error?: string }>;

/** One-click publish/unpublish/archive straight from a table row (spec §8: "list, search, filter... archive/delete where safe" without forcing a full edit-page round trip). */
export function StatusQuickActions({ id, status, action }: { id: string; status: ContentStatus; action: StatusAction }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function apply(next: ContentStatus) {
    setError(null);
    startTransition(async () => {
      const result = await action(id, next);
      if (!result.ok) setError(result.error ?? "Failed");
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-caption">
      {status !== "PUBLISHED" && (
        <button type="button" disabled={pending} onClick={() => apply("PUBLISHED")} className="text-success hover:underline disabled:opacity-50">
          Publish
        </button>
      )}
      {status === "PUBLISHED" && (
        <button type="button" disabled={pending} onClick={() => apply("DRAFT")} className="text-ink-muted hover:underline disabled:opacity-50">
          Unpublish
        </button>
      )}
      {status !== "ARCHIVED" && (
        <button type="button" disabled={pending} onClick={() => apply("ARCHIVED")} className="text-danger hover:underline disabled:opacity-50">
          Archive
        </button>
      )}
      {status === "ARCHIVED" && (
        <button type="button" disabled={pending} onClick={() => apply("DRAFT")} className="text-ink-muted hover:underline disabled:opacity-50">
          Restore to draft
        </button>
      )}
      {error && <span className="text-danger">{error}</span>}
    </div>
  );
}
