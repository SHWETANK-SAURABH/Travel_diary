import { z } from "zod";

/**
 * `guestPreferences` is only trusted for anonymous requests — see the route
 * handler. For a signed-in request the server loads preferences from the
 * database instead and ignores this field entirely (spec §49: "do not
 * trust client-side recommendation parameters blindly").
 */
export const recommendationRequestSchema = z.object({
  month: z.number().int().min(1).max(12).optional(),
  stateSlug: z.string().max(100).optional(),
  guestPreferences: z
    .object({
      interestTagIds: z.array(z.string()).max(20).optional(),
      travelStyle: z.enum(["BACKPACKER", "BUDGET", "COMFORTABLE", "LUXURY"]).optional(),
      budgetAmount: z.number().int().nonnegative().max(100_000_000).optional(),
      durationDays: z.number().int().positive().max(90).optional(),
      travellerCount: z.number().int().positive().max(50).optional(),
      crowdPreference: z.number().int().min(0).max(100).optional(),
      travelDateStart: z.string().optional(),
      travelDateEnd: z.string().optional(),
    })
    .optional(),
});
