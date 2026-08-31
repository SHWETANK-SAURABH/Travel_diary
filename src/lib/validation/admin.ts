import { z } from "zod";

const statusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const precisionSchema = z.enum(["EXACT", "APPROXIMATE"]);
const popularitySchema = z.enum(["POPULAR", "HIDDEN", "LOCAL_EMERGING"]);
const recurrenceSchema = z.enum(["ANNUAL_FIXED_DATE", "ANNUAL_LUNAR_OR_REGIONAL_CALENDAR", "ANNUAL_VARIABLE", "ONE_TIME", "IRREGULAR"]);
const dateConfidenceSchema = z.enum(["NOT_ANNOUNCED", "AI_SUGGESTED", "EXPECTED", "CONFIRMED", "ADMIN_VERIFIED"]);
const verificationStatusSchema = z.enum(["UNVERIFIED", "AI_GENERATED", "ADMIN_VERIFIED", "ADMIN_OVERRIDDEN"]);
const budgetLevelSchema = z.enum(["BUDGET", "MID_RANGE", "LUXURY"]);
const tagCategorySchema = z.enum(["INTEREST", "TRAVELLER_FIT", "GENERAL"]);
const locationTypeSchema = z.enum(["COUNTRY", "STATE", "REGION", "CITY"]);

const monthSchema = z.number().int().min(1).max(12);

// ---------------------------------------------------------------------------
// Festival
// ---------------------------------------------------------------------------

export const festivalFormSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(200).optional(), // blank/omitted -> derive from name
  description: z.string().trim().min(1).max(20_000),
  categoryId: z.string().min(1),
  status: statusSchema.optional(),
  popularity: popularitySchema.optional(),
  featured: z.boolean().optional(),

  locationId: z.string().min(1),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  precision: precisionSchema.optional(),

  recurrenceType: recurrenceSchema.optional(),
  recurrenceNotes: z.string().trim().max(2000).optional(),
  typicalDurationDays: z.number().int().positive().max(60).optional(),

  tagIds: z.array(z.string()).max(50).optional(),
  travellerFitTagIds: z.array(z.string()).max(50).optional(),
  destinationIds: z.array(z.string()).max(50).optional(),
  experienceIds: z.array(z.string()).max(50).optional(),
  foodIds: z.array(z.string()).max(50).optional(),
});
export const updateFestivalFormSchema = festivalFormSchema.partial();

export const festivalOccurrenceSchema = z
  .object({
    year: z.number().int().min(2020).max(2100),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    dateConfidence: dateConfidenceSchema,
    source: z.string().trim().max(500).optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    message: "End date can't be before the start date.",
    path: ["endDate"],
  });

export const festivalVerificationSchema = z.object({
  verificationStatus: verificationStatusSchema,
  verificationSource: z.string().trim().max(500).optional(),
});

// ---------------------------------------------------------------------------
// Destination
// ---------------------------------------------------------------------------

export const destinationFormSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(200).optional(),
  description: z.string().trim().min(1).max(20_000),
  categoryId: z.string().min(1).optional(),
  status: statusSchema.optional(),
  popularity: popularitySchema.optional(),
  featured: z.boolean().optional(),

  locationId: z.string().min(1),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  precision: precisionSchema.optional(),

  bestTimeStartMonth: monthSchema.optional(),
  bestTimeEndMonth: monthSchema.optional(),
  altTimeStartMonth: monthSchema.optional(),
  altTimeEndMonth: monthSchema.optional(),
  bestTimeExplanation: z.string().trim().max(2000).optional(),
  bestTimeSource: verificationStatusSchema.optional(),

  budgetLevel: budgetLevelSchema.optional(),
  approximateCostPerDay: z.number().int().nonnegative().max(1_000_000).optional(),

  tagIds: z.array(z.string()).max(50).optional(),
  experienceIds: z.array(z.string()).max(50).optional(),
  foodIds: z.array(z.string()).max(50).optional(),
});
export const updateDestinationFormSchema = destinationFormSchema.partial();

export const destinationVerificationSchema = z.object({
  verificationStatus: verificationStatusSchema,
});

// ---------------------------------------------------------------------------
// Experience / Food — simpler forms per spec §16
// ---------------------------------------------------------------------------

export const experienceFormSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(200).optional(),
  description: z.string().trim().min(1).max(20_000),
  category: z.string().trim().max(100).optional(),
  status: statusSchema.optional(),
  featured: z.boolean().optional(),
  locationId: z.string().min(1),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  tagIds: z.array(z.string()).max(50).optional(),
  destinationIds: z.array(z.string()).max(50).optional(),
  festivalIds: z.array(z.string()).max(50).optional(),
});
export const updateExperienceFormSchema = experienceFormSchema.partial();

export const foodFormSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(200).optional(),
  description: z.string().trim().min(1).max(20_000),
  region: z.string().trim().max(100).optional(),
  status: statusSchema.optional(),
  featured: z.boolean().optional(),
  locationId: z.string().min(1).optional(),
  tagIds: z.array(z.string()).max(50).optional(),
  destinationIds: z.array(z.string()).max(50).optional(),
  festivalIds: z.array(z.string()).max(50).optional(),
});
export const updateFoodFormSchema = foodFormSchema.partial();

// ---------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------

export const locationFormSchema = z.object({
  type: locationTypeSchema,
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(200).optional(),
  parentId: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  precision: precisionSchema.optional(),
  nearestAirport: z.string().trim().max(200).optional(),
  nearestRailwayStation: z.string().trim().max(200).optional(),
  roadAccessNotes: z.string().trim().max(2000).optional(),
  localTransportNotes: z.string().trim().max(2000).optional(),
  accommodationNotes: z.string().trim().max(2000).optional(),
});
export const updateLocationFormSchema = locationFormSchema.partial();

// ---------------------------------------------------------------------------
// Media — URL-reference only (see docs/architecture.md for why there's no
// binary upload path in this environment).
// ---------------------------------------------------------------------------

const contentTypeSchema = z.enum(["FESTIVAL", "DESTINATION", "EXPERIENCE", "FOOD", "EVENT"]);

export const mediaFormSchema = z.object({
  url: z.string().trim().url().max(2000),
  altText: z.string().trim().max(500).optional(),
  type: z.enum(["IMAGE", "VIDEO"]).optional(),
  order: z.number().int().min(0).max(1000).optional(),
  contentType: contentTypeSchema,
  contentId: z.string().min(1),
});
export const updateMediaFormSchema = z.object({
  altText: z.string().trim().max(500).optional(),
  order: z.number().int().min(0).max(1000).optional(),
});

// ---------------------------------------------------------------------------
// Taxonomy — categories + tags
// ---------------------------------------------------------------------------

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  order: z.number().int().min(0).max(1000).optional(),
});
export const updateCategoryFormSchema = categoryFormSchema.partial();

export const tagFormSchema = z.object({
  name: z.string().trim().min(1).max(60),
  category: tagCategorySchema.optional(),
});
export const updateTagFormSchema = tagFormSchema.partial();
