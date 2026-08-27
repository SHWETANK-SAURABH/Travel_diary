"use client";

import { useEffect, useRef, useState } from "react";
import { SearchInput } from "@/components/ui";
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
  const [results, setResults] = useState<MapSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      fetch(`/api/map/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setResults(data.results ?? []))
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

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

      {open && results.length > 0 && (
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
