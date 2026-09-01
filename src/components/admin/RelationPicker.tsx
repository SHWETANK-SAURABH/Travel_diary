"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export interface RelationOption {
  id: string;
  name: string;
}

export type RelationSearchType = "festival" | "destination" | "experience" | "food" | "location" | "tag" | "festivalCategory" | "destinationCategory";

interface RelationPickerProps {
  label: string;
  searchType: RelationSearchType;
  value: RelationOption[];
  onChange: (next: RelationOption[]) => void;
  /** Single-select mode (e.g. picking one parent Location) — replaces rather than appends. */
  single?: boolean;
  placeholder?: string;
}

/**
 * The searchable, chip-based relationship selector spec §12/§40 asks for —
 * "[Hornbill Festival ×] [Add festival]", never a raw id field. Debounced
 * typeahead against `/api/admin/search`, admin-only. Used for every
 * festival/destination/experience/food cross-connection, every tag
 * assignment, and single-select location/category pickers.
 */
export function RelationPicker({ label, searchType, value, onChange, single = false, placeholder = "Search…" }: RelationPickerProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const trimmedQuery = debouncedQuery.trim();
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<RelationOption[]>([]);
  const [searched, setSearched] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const selectedIds = new Set(value.map((v) => v.id));

  // Same debounce-and-fetch shape as the header's universal search
  // (src/components/layout/HeaderSearch.tsx) — every setState call lives
  // inside the fetch's own callback, never synchronously in the effect body,
  // so a stale in-flight request can't clobber a newer one's result.
  useEffect(() => {
    if (!open || trimmedQuery.length === 0) return;
    const controller = new AbortController();
    fetch(`/api/admin/search?type=${searchType}&q=${encodeURIComponent(trimmedQuery)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: { results: RelationOption[] }) => {
        setResults(data.results ?? []);
        setSearched(true);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [trimmedQuery, open, searchType]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function select(option: RelationOption) {
    if (single) {
      onChange([option]);
    } else if (!selectedIds.has(option.id)) {
      onChange([...value, option]);
    }
    setQuery("");
    setSearched(false);
    setOpen(false);
  }

  function remove(id: string) {
    onChange(value.filter((v) => v.id !== id));
  }

  const visibleResults = single ? results : results.filter((r) => !selectedIds.has(r.id));

  return (
    <div ref={rootRef} className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <span key={item.id} className="inline-flex items-center gap-1 rounded-full bg-marigold-50 py-1 pr-1.5 pl-2.5 text-xs text-marigold-600">
              {item.name}
              <button type="button" onClick={() => remove(item.id)} aria-label={`Remove ${item.name}`} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-marigold-100">
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <Input
            id={inputId}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearched(false);
              setOpen(true);
            }}
            placeholder={placeholder}
            className="h-9 pl-8 text-sm"
          />
        </div>

        {open && query.trim().length > 0 && (
          <div className="absolute top-full left-0 z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-paper-raised shadow-panel">
            {!searched && <p className="px-3 py-2 text-caption text-ink-muted">Searching…</p>}
            {searched && visibleResults.length === 0 && <p className="px-3 py-2 text-caption text-ink-muted">No matches.</p>}
            {searched &&
              visibleResults.map((option) => (
                <button key={option.id} type="button" onClick={() => select(option)} className="block w-full truncate px-3 py-2 text-left text-sm text-ink hover:bg-marigold-50">
                  {option.name}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
