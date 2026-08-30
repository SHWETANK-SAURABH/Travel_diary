import { z } from "zod";

export const updatePreferenceSchema = z.object({
  travelDateStart: z.coerce.date().optional(),
  travelDateEnd: z.coerce.date().optional(),
  durationDays: z.number().int().positive().max(90).optional(),
  travellerCount: z.number().int().positive().max(50).optional(),
  budgetAmount: z.number().int().nonnegative().max(100_000_000).optional(),
  travelStyle: z.enum(["BACKPACKER", "BUDGET", "COMFORTABLE", "LUXURY"]).optional(),
  crowdPreference: z.number().int().min(0).max(100).optional(),
  interestTagIds: z.array(z.string()).max(20).optional(),
});
