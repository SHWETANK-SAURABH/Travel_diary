import type { ContentType } from "@prisma/client";

export interface SearchResult {
  contentType: ContentType | "LOCATION";
  id: string;
  slug?: string;
  name: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}
