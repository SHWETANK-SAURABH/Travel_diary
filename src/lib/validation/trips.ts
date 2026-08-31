import { z } from "zod";

const contentTypeSchema = z.enum(["FESTIVAL", "DESTINATION", "EXPERIENCE", "FOOD", "EVENT"]);

export const createTripSchema = z.object({
  name: z.string().min(1).max(200),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  days: z.number().int().positive().max(365).optional(),
  travellerCount: z.number().int().positive().max(50).optional(),
  estimatedBudget: z.number().int().nonnegative().max(100_000_000).optional(),
  locationId: z.string().optional(),
  visibility: z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]).optional(),
});

export const updateTripSchema = createTripSchema.partial();

export const addTripItemSchema = z.object({
  day: z.number().int().positive().max(365),
  contentType: contentTypeSchema.optional(),
  contentId: z.string().optional(),
  locationId: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export const reorderTripItemsSchema = z.object({
  day: z.number().int().positive().max(365),
  orderedItemIds: z.array(z.string().min(1)).max(200),
});

export const moveTripItemSchema = z.object({
  day: z.number().int().positive().max(365),
});

export const resolveContentSchema = z.object({
  items: z
    .array(
      z.object({
        contentType: contentTypeSchema,
        contentId: z.string().min(1),
      })
    )
    .max(200),
});

/** No auth required (see the route) — a guest itinerary has no server Trip row, so this is the only way to get budget/conflict/suggestion heuristics for it. */
export const tripInsightsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  days: z.number().int().positive().max(365).optional(),
  travellerCount: z.number().int().positive().max(50).optional(),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        contentType: contentTypeSchema.optional(),
        contentId: z.string().optional(),
      })
    )
    .max(200),
});
