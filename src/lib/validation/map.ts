import { z } from "zod";

export const viewportQuerySchema = z.object({
  minLat: z.coerce.number().min(-90).max(90),
  minLng: z.coerce.number().min(-180).max(180),
  maxLat: z.coerce.number().min(-90).max(90),
  maxLng: z.coerce.number().min(-180).max(180),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export const mapSearchQuerySchema = z.object({
  q: z.string().min(2).max(100),
});

export const mapDiscoveryQuerySchema = z.object({
  kind: z.enum(["festival", "destination", "experience", "event"]),
  /** A slug for festival/destination/experience; the raw id for event (which has no slug). */
  identifier: z.string().min(1),
});

export const analyticsEventSchema = z.object({
  type: z.enum([
    "PAGE_VIEW",
    "FESTIVAL_VIEW",
    "DESTINATION_VIEW",
    "MAP_INTERACTION",
    "MAP_MARKER_CLICK",
    "MAP_ZOOM",
    "STATE_EXPLORATION",
    "SEARCH_QUERY",
    "SEARCH_ZERO_RESULT",
    "SAVE",
    "ADD_TO_TRIP",
    "TRIP_CREATED",
    "RECOMMENDATION_CLICK",
  ]),
  path: z.string().max(500).optional(),
  contentType: z.enum(["FESTIVAL", "DESTINATION", "EXPERIENCE", "FOOD", "EVENT"]).optional(),
  contentId: z.string().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const toggleSavedSchema = z.object({
  contentType: z.enum(["FESTIVAL", "DESTINATION", "EXPERIENCE", "FOOD", "EVENT"]),
  contentId: z.string().min(1),
});
