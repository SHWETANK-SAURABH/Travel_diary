import Link from "next/link";
import { cn } from "@/components/ui/cn";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FestivalFilterPillsProps {
  label: string;
  options: FilterOption[];
  activeValue?: string;
  paramName: string;
  baseParams: Record<string, string | undefined>;
}

/** Generic server-rendered filter pill row (category, popularity, ...) — same link-based pattern as FestivalMonthFilter, for filters that aren't the specifically-shaped month/"All Year" case. */
export function FestivalFilterPills({ label, options, activeValue, paramName, baseParams }: FestivalFilterPillsProps) {
  function hrefFor(value: string | undefined) {
    const params = new URLSearchParams(Object.entries(baseParams).filter(([, v]) => v) as [string, string][]);
    if (value) params.set(paramName, value);
    else params.delete(paramName);
    const qs = params.toString();
    return qs ? `/festivals?${qs}` : "/festivals";
  }

  return (
    <div role="group" aria-label={label}>
      <p className="text-label font-medium tracking-wide text-ink-muted uppercase">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <Link
          href={hrefFor(undefined)}
          className={cn(
            "inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors duration-fast",
            !activeValue ? "border-marigold-500 bg-marigold-500 text-white" : "border-border text-ink hover:bg-marigold-50"
          )}
        >
          All
        </Link>
        {options.map((option) => (
          <Link
            key={option.value}
            href={hrefFor(option.value)}
            className={cn(
              "inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors duration-fast",
              activeValue === option.value
                ? "border-marigold-500 bg-marigold-500 text-white"
                : "border-border text-ink hover:bg-marigold-50"
            )}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
