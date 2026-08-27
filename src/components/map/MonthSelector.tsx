"use client";

import { Pill } from "@/components/ui";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface MonthSelectorProps {
  /** 1-12, or null for "All Year". */
  value: number | null;
  onChange: (month: number | null) => void;
}

/** Presentational month/All-Year picker — the map's data wiring (Phase 3) drives it via `value`/`onChange`. */
export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by month">
      <Pill selected={value === null} onClick={() => onChange(null)}>
        All Year
      </Pill>
      {MONTHS.map((label, i) => (
        <Pill key={label} selected={value === i + 1} onClick={() => onChange(i + 1)}>
          {label}
        </Pill>
      ))}
    </div>
  );
}
