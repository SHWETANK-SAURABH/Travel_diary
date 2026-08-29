import Link from "next/link";
import { cn } from "@/components/ui/cn";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface FestivalMonthFilterProps {
  activeMonth: number | null;
  /** Other active query params (state, category, popularity) to preserve when switching months. */
  baseParams?: Record<string, string | undefined>;
}

/** "Browse by Month" — server-rendered links (not client state), so it works with JS disabled and is a real, bookmarkable/crawlable URL per month. */
export function FestivalMonthFilter({ activeMonth, baseParams = {} }: FestivalMonthFilterProps) {
  function hrefFor(month: number | null) {
    const params = new URLSearchParams(Object.entries(baseParams).filter(([, v]) => v) as [string, string][]);
    if (month) params.set("month", String(month));
    const qs = params.toString();
    return qs ? `/festivals?${qs}` : "/festivals";
  }

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Browse festivals by month">
      <Link
        href={hrefFor(null)}
        className={cn(
          "inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors duration-fast",
          activeMonth === null ? "border-marigold-500 bg-marigold-500 text-white" : "border-border text-ink hover:bg-marigold-50"
        )}
      >
        All Year
      </Link>
      {MONTHS.map((label, i) => (
        <Link
          key={label}
          href={hrefFor(i + 1)}
          className={cn(
            "inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors duration-fast",
            activeMonth === i + 1 ? "border-marigold-500 bg-marigold-500 text-white" : "border-border text-ink hover:bg-marigold-50"
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
