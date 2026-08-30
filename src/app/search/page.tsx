import type { Metadata } from "next";
import Link from "next/link";
import { search, getSearchSuggestions } from "@/features/search/service";
import type { SearchResult, SearchResultType } from "@/features/search/types";
import { Container } from "@/components/layout";
import { SearchInput, SearchResultGroup, EmptyState, ResponsiveImage } from "@/components/ui";
import { TrackedLink } from "@/components/discovery";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false }, // query pages aren't indexable content
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

const GROUP_LABELS: Record<SearchResultType, string> = {
  FESTIVAL: "Festivals",
  DESTINATION: "Destinations",
  EXPERIENCE: "Experiences",
  FOOD: "Food",
  EVENT: "Events",
  LOCATION: "Places",
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const trimmed = q.trim();
  const { results } = trimmed ? await search(trimmed) : { results: [] as SearchResult[] };
  const suggestions = trimmed && results.length === 0 ? await getSearchSuggestions() : null;

  const grouped = new Map<SearchResultType, SearchResult[]>();
  for (const result of results) {
    grouped.set(result.contentType, [...(grouped.get(result.contentType) ?? []), result]);
  }

  return (
    <Container className="py-12">
      <h1 className="text-h1 font-display">Search</h1>
      <form className="mt-6 max-w-md" action="/search" method="get">
        <SearchInput name="q" defaultValue={q} placeholder="Festivals, destinations, cities…" />
      </form>

      {trimmed && results.length > 0 && (
        <p className="mt-6 text-caption text-ink-muted">
          {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{trimmed}&rdquo;
        </p>
      )}

      {trimmed && results.length === 0 && (
        <>
          <EmptyState
            className="mt-8"
            title="No results"
            description={`We couldn't find anything matching "${trimmed}".`}
          />
          {suggestions && (suggestions.popularFestivals.length > 0 || suggestions.popularDestinations.length > 0) && (
            <div className="mx-auto mt-4 flex max-w-md flex-col gap-8">
              {suggestions.popularFestivals.length > 0 && (
                <div>
                  <h2 className="text-label font-medium tracking-wide text-ink-muted uppercase">Popular festivals</h2>
                  <ul className="mt-2 flex flex-col gap-2">
                    {suggestions.popularFestivals.map((f) => (
                      <li key={f.id}>
                        <Link href={`/festivals/${f.slug}`} className="text-sm text-ink hover:text-marigold-600">
                          {f.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {suggestions.popularDestinations.length > 0 && (
                <div>
                  <h2 className="text-label font-medium tracking-wide text-ink-muted uppercase">Popular destinations</h2>
                  <ul className="mt-2 flex flex-col gap-2">
                    {suggestions.popularDestinations.map((d) => (
                      <li key={d.id}>
                        <Link href={`/destinations/${d.slug}`} className="text-sm text-ink hover:text-marigold-600">
                          {d.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {results.length > 0 && (
        <div className="mt-4 max-w-md">
          {[...grouped.entries()].map(([contentType, items]) => (
            <SearchResultGroup key={contentType} label={GROUP_LABELS[contentType]}>
              {items.map((item) => {
                const inner = (
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <ResponsiveImage src={item.imageUrl} alt="" aspectRatio="1/1" containerClassName="h-12 w-12 shrink-0 rounded-md" className="rounded-md" sizes="48px" />
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-md bg-marigold-50" aria-hidden="true" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">{item.name}</p>
                      {item.metadata && <p className="truncate text-label text-ink-muted">{item.metadata}</p>}
                    </div>
                  </div>
                );
                return (
                  <li key={`${contentType}-${item.id}`}>
                    {item.href ? (
                      <TrackedLink
                        href={item.href}
                        event={{ type: "SEARCH_RESULT_CLICK", contentType: contentType === "LOCATION" ? undefined : contentType, contentId: item.id, metadata: { resultType: contentType, name: item.name } }}
                        className="block px-3 py-2 transition-colors duration-fast hover:bg-marigold-50"
                      >
                        {inner}
                      </TrackedLink>
                    ) : (
                      <div className="px-3 py-2 opacity-70">{inner}</div>
                    )}
                  </li>
                );
              })}
            </SearchResultGroup>
          ))}
        </div>
      )}
    </Container>
  );
}
