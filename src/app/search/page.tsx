import type { Metadata } from "next";
import { search } from "@/features/search/service";
import { Container } from "@/components/layout";
import { Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false }, // query pages aren't indexable content
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const { results } = q ? await search(q) : { results: [] };

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl">Search</h1>
      <form className="mt-6 flex max-w-md gap-2" action="/search" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Festivals, destinations, cities…"
          className="h-10 w-full rounded-md border border-border bg-paper-raised px-3 text-sm"
        />
      </form>

      {q && (
        <p className="mt-6 text-sm text-ink-muted">
          {results.length === 0 ? `No results for "${q}"` : `${results.length} result${results.length === 1 ? "" : "s"} for "${q}"`}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {results.map((result) => (
          <li key={`${result.contentType}-${result.id}`} className="flex items-center gap-2 text-sm">
            <Badge variant="neutral">{result.contentType.toLowerCase()}</Badge>
            {result.name}
          </li>
        ))}
      </ul>
    </Container>
  );
}
