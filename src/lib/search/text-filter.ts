/**
 * V1 search is "normal search", not AI search: case-insensitive substring
 * matching, backed by the trigram GIN indexes from the
 * `search_and_geo_indexes` migration so it stays fast without a dedicated
 * search engine. If/when relevance ranking matters more than it does today,
 * swap this for `similarity()`-ranked raw SQL or an external index
 * (Meilisearch/Typesense) behind the same `search()` call sites in
 * src/features/search.
 */
export function containsInsensitive(query: string) {
  return { contains: query, mode: "insensitive" } as const;
}
