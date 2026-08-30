"use client";

import { useEffect, useRef, useState } from "react";
import { SearchInput } from "@/components/ui";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import type { MapSearchResult } from "@/features/map/types";

export interface MapSearchProps {
  onSelect: (result: MapSearchResult) => void;
}

const KIND_LABEL: Record<MapSearchResult["kind"], string> = {
  state: "State",
  city: "City",
  festival: "Festival",
  destination: "Destination",
};

/** Map-specific search — separate from the site's universal search (src/features/search); every result here has coordinates so the map can fly to it. */
export function MapSearch({ onSelect }: MapSearchProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const trimmedQuery = debouncedQuery.trim();
  const [results, setResults] = useState<MapSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Below the minimum length, render-time gating (see `trimmedQuery.length >= 2`
    // below) hides whatever `results` still holds — no need to clear it here,
    // which keeps this effect's only setState call inside the fetch's `.then()`.
    if (trimmedQuery.length < 2) return;
    const controller = new AbortController();
    fetch(`/api/map/search?q=${encodeURIComponent(trimmedQuery)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setResults(data.results ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, [trimmedQuery]);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative w-full max-w-xs">
      <SearchInput
        placeholder="Search the map…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClear={() => {
          setQuery("");
          setResults([]);
        }}
      />

      {open && trimmedQuery.length >= 2 && results.length > 0 && (
        <ul className="absolute top-full z-10 mt-1 w-full rounded-md border border-border bg-paper-raised py-1 shadow-panel">
          {results.map((result) => (
            <li key={`${result.kind}-${result.id}`}>
              <button
                type="button"
                onClick={() => {
                  onSelect(result);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink hover:bg-marigold-50"
              >
                {result.name}
                <span className="text-label text-ink-muted">{KIND_LABEL[result.kind]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
