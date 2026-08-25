import { z } from "zod";

const contentTypeSchema = z.enum(["FESTIVAL", "DESTINATION", "EXPERIENCE", "FOOD", "EVENT"]);

export const guestStateSchema = z.object({
  savedItems: z.array(
    z.object({
      contentType: contentTypeSchema,
      contentId: z.string().min(1),
      savedAt: z.string(),
    })
  ),
  trips: z.array(
    z.object({
      localId: z.string().min(1),
      name: z.string().min(1).max(200),
      days: z.number().int().positive().optional(),
      estimatedBudget: z.number().int().nonnegative().optional(),
      items: z.array(
        z.object({
          day: z.number().int().positive(),
          order: z.number().int().nonnegative(),
          contentType: contentTypeSchema.optional(),
          contentId: z.string().optional(),
          notes: z.string().max(2000).optional(),
        })
      ),
      updatedAt: z.string(),
    })
  ),
});
