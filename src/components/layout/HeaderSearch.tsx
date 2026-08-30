"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { SearchOverlay, SearchResultGroup } from "@/components/ui";
import { TrackedLink } from "@/components/discovery";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { trackClientEvent } from "@/lib/analytics/client";
import type { SearchResult, SearchResultType, SearchSuggestions } from "@/features/search/types";

const GROUP_LABELS: Record<SearchResultType, string> = {
  FESTIVAL: "Festivals",
  DESTINATION: "Destinations",
  EXPERIENCE: "Experiences",
  FOOD: "Food",
  EVENT: "Events",
  LOCATION: "Places",
};

/** Header's search trigger + live categorized results. Submitting still routes to /search (shareable URL); the overlay itself now executes debounced queries for fast in-place suggestions. */
export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const debouncedValue = useDebouncedValue(value, 300);
  const trimmedValue = debouncedValue.trim();
  const queryTooShort = trimmedValue.length < 2;
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestions | null>(null);
  const [searched, setSearched] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Below the minimum length, render-time gating (via `queryTooShort` below)
    // hides whatever `results`/`searched` still hold — no need to clear them
    // here, which keeps this effect's only setState calls inside the fetch's
    // `.then()`.
    if (!open || queryTooShort) return;
    const controller = new AbortController();
    fetch(`/api/search/suggest?q=${encodeURIComponent(trimmedValue)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: { results: SearchResult[] }) => {
        setResults(data.results ?? []);
        setSearched(true);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [trimmedValue, open, queryTooShort]);

  useEffect(() => {
    if (open && !queryTooShort && results.length === 0 && searched && !suggestions) {
      fetch("/api/search/popular")
        .then((res) => res.json())
        .then(setSuggestions)
        .catch(() => {});
    }
  }, [open, queryTooShort, results.length, searched, suggestions]);

  function openOverlay() {
    setOpen(true);
    trackClientEvent({ type: "SEARCH_OPENED" });
  }

  function closeOverlay() {
    setOpen(false);
    setValue("");
    setResults([]);
    setSearched(false);
  }

  const grouped = new Map<SearchResultType, SearchResult[]>();
  for (const result of results) {
    grouped.set(result.contentType, [...(grouped.get(result.contentType) ?? []), result]);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        onClick={openOverlay}
        className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors duration-fast hover:bg-marigold-50 hover:text-ink"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>

      <SearchOverlay
        open={open}
        onClose={closeOverlay}
        value={value}
        onValueChange={setValue}
        onSubmit={(query) => {
          if (!query.trim()) return;
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          closeOverlay();
        }}
      >
        {!queryTooShort && (results.length > 0 || searched) && (
          <>
            {results.length > 0 && (
              <div>
                {[...grouped.entries()].map(([contentType, items]) => (
                  <SearchResultGroup key={contentType} label={GROUP_LABELS[contentType]}>
                    {items.map((item) => {
                      const content = (
                        <>
                          <span className="block text-sm text-ink">{item.name}</span>
                          {item.metadata && <span className="block text-label text-ink-muted">{item.metadata}</span>}
                        </>
                      );
                      return (
                        <li key={`${contentType}-${item.id}`}>
                          {item.href ? (
                            <TrackedLink
                              href={item.href}
                              onClick={closeOverlay}
                              event={{ type: "SEARCH_RESULT_CLICK", contentType: contentType === "LOCATION" ? undefined : contentType, contentId: item.id, metadata: { resultType: contentType, name: item.name } }}
                              className="block px-3 py-2 transition-colors duration-fast hover:bg-marigold-50"
                            >
                              {content}
                            </TrackedLink>
                          ) : (
                            <span className="block px-3 py-2 opacity-70">{content}</span>
                          )}
                        </li>
                      );
                    })}
                  </SearchResultGroup>
                ))}
              </div>
            )}

            {searched && results.length === 0 && (
              <div className="p-4">
                <p className="text-sm text-ink">We couldn&rsquo;t find anything matching &ldquo;{value.trim()}&rdquo;.</p>
                {suggestions && (suggestions.popularFestivals.length > 0 || suggestions.popularDestinations.length > 0) && (
                  <div className="mt-4 flex flex-col gap-3">
                    {suggestions.popularFestivals.length > 0 && (
                      <div>
                        <p className="text-label font-medium tracking-wide text-ink-muted uppercase">Popular festivals</p>
                        <ul className="mt-1 flex flex-col gap-1">
                          {suggestions.popularFestivals.map((f) => (
                            <li key={f.id}>
                              <TrackedLink
                                href={`/festivals/${f.slug}`}
                                onClick={closeOverlay}
                                event={{ type: "SEARCH_RESULT_CLICK", contentType: "FESTIVAL", contentId: f.id, metadata: { resultType: "suggestion" } }}
                                className="text-sm text-ink hover:text-marigold-600"
                              >
                                {f.name}
                              </TrackedLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {suggestions.popularDestinations.length > 0 && (
                      <div>
                        <p className="text-label font-medium tracking-wide text-ink-muted uppercase">Popular destinations</p>
                        <ul className="mt-1 flex flex-col gap-1">
                          {suggestions.popularDestinations.map((d) => (
                            <li key={d.id}>
                              <TrackedLink
                                href={`/destinations/${d.slug}`}
                                onClick={closeOverlay}
                                event={{ type: "SEARCH_RESULT_CLICK", contentType: "DESTINATION", contentId: d.id, metadata: { resultType: "suggestion" } }}
                                className="text-sm text-ink hover:text-marigold-600"
                              >
                                {d.name}
                              </TrackedLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </SearchOverlay>
    </>
  );
}
