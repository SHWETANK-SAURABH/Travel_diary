import type { BoundingBox } from "@/lib/geo";
import type { ContentType } from "@prisma/client";

export interface MapMarker {
  id: string;
  contentType: ContentType;
  name: string;
  latitude: number;
  longitude: number;
}

export interface MapViewportQuery {
  box: BoundingBox;
  /** 1-12. Filters festivals to those with a same-month occurrence — the "changes based on month" layer from the product spec. */
  month?: number;
  layers?: Array<"festivals" | "destinations">;
}
