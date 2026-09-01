import { z } from "zod";

const contentTypeSchema = z.enum(["FESTIVAL", "DESTINATION", "EXPERIENCE", "FOOD", "EVENT"]);

const guestPreferencesSchema = z.object({
  travelDateStart: z.string().optional(),
  travelDateEnd: z.string().optional(),
  durationDays: z.number().int().positive().max(90).optional(),
  travellerCount: z.number().int().positive().max(50).optional(),
  budgetAmount: z.number().int().nonnegative().max(100_000_000).optional(),
  travelStyle: z.enum(["BACKPACKER", "BUDGET", "COMFORTABLE", "LUXURY"]).optional(),
  crowdPreference: z.number().int().min(0).max(100).optional(),
  interestTagIds: z.array(z.string()).max(20).optional(),
  updatedAt: z.string(),
});

export const guestStateSchema = z.object({
  savedItems: z.array(
    z.object({
      contentType: contentTypeSchema,
      contentId: z.string().min(1),
      savedAt: z.string(),
    })
  ),
  visitedItems: z.array(
    z.object({
      contentType: contentTypeSchema,
      contentId: z.string().min(1),
      visitedAt: z.string(),
    })
  ),
  trips: z.array(
    z.object({
      localId: z.string().min(1),
      name: z.string().min(1).max(200),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      days: z.number().int().positive().max(365).optional(),
      travellerCount: z.number().int().positive().max(50).optional(),
      estimatedBudget: z.number().int().nonnegative().optional(),
      items: z.array(
        z.object({
          id: z.string().min(1),
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
  preferences: guestPreferencesSchema.nullable(),
  /** The guest's localStorage analytics id (spec §6: "do not create unnecessary duplicate identities" on sign-in) — used only to re-key their pre-signup AnalyticsEvent/SearchQueryLog rows onto the new account, never stored as guest content itself. */
  analyticsAnonymousId: z.string().uuid().optional(),
});
