import type { Metadata } from "next";
import Link from "next/link";
import { search } from "@/features/search/service";
import type { SearchResult } from "@/features/search/types";
import { Container } from "@/components/layout";
import { SearchInput, SearchResultGroup, EmptyState } from "@/components/ui";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false }, // query pages aren't indexable content
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

const GROUP_LABELS: Record<SearchResult["contentType"], string> = {
  FESTIVAL: "Festivals",
  DESTINATION: "Destinations",
  EXPERIENCE: "Experiences",
  FOOD: "Food",
  EVENT: "Events",
  LOCATION: "Places",
};

const DETAIL_HREF: Partial<Record<SearchResult["contentType"], (slug: string) => string>> = {
  FESTIVAL: (slug) => `/festivals/${slug}`,
  DESTINATION: (slug) => `/destinations/${slug}`,
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const { results } = q ? await search(q) : { results: [] };

  const grouped = new Map<SearchResult["contentType"], SearchResult[]>();
  for (const result of results) {
    grouped.set(result.contentType, [...(grouped.get(result.contentType) ?? []), result]);
  }

  return (
    <Container className="py-12">
      <h1 className="text-h1 font-display">Search</h1>
      <form className="mt-6 max-w-md" action="/search" method="get">
        <SearchInput name="q" defaultValue={q} placeholder="Festivals, destinations, cities…" />
      </form>

      {q && results.length > 0 && (
        <p className="mt-6 text-caption text-ink-muted">
          {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
        </p>
      )}

      {q && results.length === 0 && (
        <EmptyState
          className="mt-8"
          title="No results"
          description={`We couldn't find anything matching "${q}".`}
        />
      )}

      {results.length > 0 && (
        <div className="mt-4 max-w-md">
          {[...grouped.entries()].map(([contentType, items]) => (
            <SearchResultGroup key={contentType} label={GROUP_LABELS[contentType]}>
              {items.map((item) => {
                const href = DETAIL_HREF[contentType]?.(item.slug ?? "");
                return href ? (
                  <li key={`${contentType}-${item.id}`}>
                    <Link href={href} className="block px-3 py-2 text-sm text-ink transition-colors duration-fast hover:bg-marigold-50">
                      {item.name}
                    </Link>
                  </li>
                ) : (
                  <li key={`${contentType}-${item.id}`} className="px-3 py-2 text-sm text-ink">
                    {item.name}
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
