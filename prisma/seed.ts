/**
 * Demo/seed dataset — NOT verified production content. Every row this
 * script creates is flagged `isSeed: true` so it can be found and wiped
 * separately from real CMS-entered content later:
 *
 *   npx prisma studio          # browse
 *   DELETE FROM "Festival" WHERE "isSeed" = true;  -- example manual wipe
 *
 * Idempotent: re-running upserts by slug instead of duplicating rows.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function upsertLocation(input: {
  slug: string;
  name: string;
  type: "COUNTRY" | "STATE" | "REGION" | "CITY";
  parentSlug?: string;
  latitude?: number;
  longitude?: number;
}) {
  const parent = input.parentSlug
    ? await db.location.findUniqueOrThrow({ where: { slug: input.parentSlug } })
    : null;

  return db.location.upsert({
    where: { slug: input.slug },
    create: {
      slug: input.slug,
      name: input.name,
      type: input.type,
      parentId: parent?.id,
      latitude: input.latitude,
      longitude: input.longitude,
      precision: input.latitude != null ? "EXACT" : "APPROXIMATE",
      isSeed: true,
    },
    update: {},
  });
}

async function main() {
  console.log("Seeding demo data…");

  // --- Geographic hierarchy -------------------------------------------------
  await upsertLocation({ slug: "india", name: "India", type: "COUNTRY" });

  const states = [
    { slug: "nagaland", name: "Nagaland" },
    { slug: "rajasthan", name: "Rajasthan" },
    { slug: "goa", name: "Goa" },
    { slug: "kerala", name: "Kerala" },
    { slug: "west-bengal", name: "West Bengal" },
    { slug: "arunachal-pradesh", name: "Arunachal Pradesh" },
    { slug: "tamil-nadu", name: "Tamil Nadu" },
    { slug: "karnataka", name: "Karnataka" },
    { slug: "himachal-pradesh", name: "Himachal Pradesh" },
  ];
  for (const s of states) {
    await upsertLocation({ ...s, type: "STATE", parentSlug: "india" });
  }

  const cities = [
    { slug: "kohima", name: "Kohima", parentSlug: "nagaland", latitude: 25.6751, longitude: 94.1086 },
    { slug: "jaisalmer", name: "Jaisalmer", parentSlug: "rajasthan", latitude: 26.9157, longitude: 70.9083 },
    { slug: "pushkar", name: "Pushkar", parentSlug: "rajasthan", latitude: 26.4899, longitude: 74.5511 },
    { slug: "panaji", name: "Panaji", parentSlug: "goa", latitude: 15.4909, longitude: 73.8278 },
    { slug: "kochi", name: "Kochi", parentSlug: "kerala", latitude: 9.9312, longitude: 76.2673 },
    { slug: "alleppey", name: "Alleppey", parentSlug: "kerala", latitude: 9.4981, longitude: 76.3388 },
    { slug: "kolkata", name: "Kolkata", parentSlug: "west-bengal", latitude: 22.5726, longitude: 88.3639 },
    { slug: "ziro-valley", name: "Ziro Valley", parentSlug: "arunachal-pradesh", latitude: 27.5486, longitude: 93.8259 },
    { slug: "madurai", name: "Madurai", parentSlug: "tamil-nadu", latitude: 9.9252, longitude: 78.1198 },
    { slug: "hampi", name: "Hampi", parentSlug: "karnataka", latitude: 15.335, longitude: 76.46 },
    { slug: "spiti-valley", name: "Spiti Valley", parentSlug: "himachal-pradesh", latitude: 32.2461, longitude: 78.0349 },
  ];
  const location: Record<string, Awaited<ReturnType<typeof upsertLocation>>> = {};
  for (const c of cities) {
    location[c.slug] = await upsertLocation({ ...c, type: "CITY" });
  }

  // --- Taxonomy: festival categories ---------------------------------------
  const categoryDefs = [
    { slug: "regional-cultural", name: "Regional Cultural Festivals" },
    { slug: "harvest", name: "Harvest Festivals" },
    { slug: "food", name: "Food Festivals" },
    { slug: "arts-music", name: "Arts & Music Festivals" },
    { slug: "modern-local", name: "Modern / Local Festivals" },
  ];
  const category: Record<string, { id: string }> = {};
  for (const [i, c] of categoryDefs.entries()) {
    category[c.slug] = await db.festivalCategory.upsert({
      where: { slug: c.slug },
      create: { ...c, order: i },
      update: {},
    });
  }

  // --- Taxonomy: tags --------------------------------------------------------
  const interestDefs = [
    "History", "Food", "Arts & Culture", "Music", "Nature",
    "Beaches", "Adventure", "Photography", "Heritage", "Offbeat Travel",
  ];
  const tag: Record<string, { id: string }> = {};
  for (const name of interestDefs) {
    const slug = slugify(name);
    tag[slug] = await db.tag.upsert({
      where: { slug },
      create: { slug, name, category: "INTEREST" },
      update: {},
    });
  }
  for (const name of ["Family Friendly", "Solo Traveller", "Photographers"]) {
    const slug = slugify(name);
    tag[slug] = await db.tag.upsert({
      where: { slug },
      create: { slug, name, category: "TRAVELLER_FIT" },
      update: {},
    });
  }

  // --- Festivals ---------------------------------------------------------
  const festivals = [
    {
      slug: "hornbill-festival",
      name: "Hornbill Festival",
      description:
        "A ten-day showcase of Naga tribal culture in Kohima — traditional music, dance, crafts, food and games from all of Nagaland's tribes in one venue.",
      categorySlug: "regional-cultural",
      popularity: "POPULAR" as const,
      locationSlug: "kohima",
      latitude: 25.6584,
      longitude: 94.1064,
      recurrenceType: "ANNUAL_FIXED_DATE" as const,
      recurrenceNotes: "Held every year, 1–10 December.",
      tags: ["arts-and-culture", "heritage", "photography"],
      travellerFit: ["photographers", "family-friendly"],
      occurrence: { year: 2026, start: "2026-12-01", end: "2026-12-10", confidence: "CONFIRMED" as const },
    },
    {
      slug: "pushkar-camel-fair",
      name: "Pushkar Camel Fair",
      description:
        "A centuries-old livestock fair turned cultural festival on the shores of Pushkar Lake — camel trading, folk music, hot-air balloons and a full moon mela.",
      categorySlug: "regional-cultural",
      popularity: "POPULAR" as const,
      locationSlug: "pushkar",
      latitude: 26.4897,
      longitude: 74.5504,
      recurrenceType: "ANNUAL_LUNAR_OR_REGIONAL_CALENDAR" as const,
      recurrenceNotes: "Timed to the Kartik Purnima full moon (Hindu lunar calendar) — the Gregorian date shifts year to year.",
      tags: ["heritage", "photography", "offbeat-travel"],
      travellerFit: ["photographers"],
      occurrence: { year: 2026, start: null, end: null, confidence: "EXPECTED" as const },
    },
    {
      slug: "goa-food-and-music-festival",
      name: "Goa Food & Music Festival",
      description:
        "A beachfront weekend of Goan-Portuguese fusion food stalls and live music, run by local restaurateurs in Panaji.",
      categorySlug: "food",
      popularity: "LOCAL_EMERGING" as const,
      locationSlug: "panaji",
      latitude: 15.4989,
      longitude: 73.8278,
      recurrenceType: "ANNUAL_VARIABLE" as const,
      recurrenceNotes: null,
      tags: ["food", "music"],
      travellerFit: [],
      occurrence: { year: 2026, start: null, end: null, confidence: "NOT_ANNOUNCED" as const },
    },
    {
      slug: "kochi-muziris-biennale",
      name: "Kochi-Muziris Biennale",
      description:
        "India's largest contemporary art exhibition, spread across historic warehouses and public spaces in Fort Kochi.",
      categorySlug: "arts-music",
      popularity: "POPULAR" as const,
      locationSlug: "kochi",
      latitude: 9.9658,
      longitude: 76.2422,
      recurrenceType: "ANNUAL_VARIABLE" as const,
      recurrenceNotes: "Runs biennially over several months rather than a fixed short window.",
      tags: ["arts-and-culture", "photography"],
      travellerFit: ["solo-traveller"],
      occurrence: { year: 2026, start: "2026-12-12", end: null, confidence: "AI_SUGGESTED" as const },
    },
    {
      slug: "poila-boishakh",
      name: "Poila Boishakh",
      description:
        "Bengali New Year — processions, sweets, new clothes and open houses across Kolkata to mark the start of the Bengali calendar.",
      categorySlug: "regional-cultural",
      popularity: "POPULAR" as const,
      locationSlug: "kolkata",
      latitude: 22.5726,
      longitude: 88.3639,
      recurrenceType: "ANNUAL_FIXED_DATE" as const,
      recurrenceNotes: "Falls on 14 or 15 April every year.",
      tags: ["heritage", "food"],
      travellerFit: ["family-friendly"],
      occurrence: { year: 2027, start: "2027-04-15", end: "2027-04-15", confidence: "ADMIN_VERIFIED" as const },
    },
    {
      slug: "ziro-festival-of-music",
      name: "Ziro Festival of Music",
      description:
        "An independent, outdoor music festival set among the rice fields of the Apatani valley — a genuinely offbeat, low-key alternative to India's bigger festival circuits.",
      categorySlug: "arts-music",
      popularity: "HIDDEN" as const,
      locationSlug: "ziro-valley",
      latitude: 27.5486,
      longitude: 93.8259,
      recurrenceType: "ANNUAL_FIXED_DATE" as const,
      recurrenceNotes: "Held every year in late September.",
      tags: ["music", "nature", "offbeat-travel"],
      travellerFit: ["solo-traveller"],
      occurrence: { year: 2026, start: "2026-09-24", end: "2026-09-27", confidence: "CONFIRMED" as const },
    },
    {
      slug: "pongal",
      name: "Pongal",
      description:
        "Tamil Nadu's four-day harvest festival — thanking the sun, the cattle and the land, marked by the ceremonial boiling-over of the Pongal dish itself.",
      categorySlug: "harvest",
      popularity: "POPULAR" as const,
      locationSlug: "madurai",
      latitude: 9.9252,
      longitude: 78.1198,
      recurrenceType: "ANNUAL_FIXED_DATE" as const,
      recurrenceNotes: "Falls in mid-January every year, aligned with the solar calendar.",
      tags: ["food", "heritage"],
      travellerFit: ["family-friendly"],
      occurrence: { year: 2027, start: "2027-01-14", end: "2027-01-17", confidence: "CONFIRMED" as const },
    },
  ];

  for (const f of festivals) {
    const created = await db.festival.upsert({
      where: { slug: f.slug },
      create: {
        slug: f.slug,
        name: f.name,
        description: f.description,
        status: "PUBLISHED",
        categoryId: category[f.categorySlug].id,
        popularity: f.popularity,
        locationId: location[f.locationSlug].id,
        latitude: f.latitude,
        longitude: f.longitude,
        precision: "EXACT",
        recurrenceType: f.recurrenceType,
        recurrenceNotes: f.recurrenceNotes,
        tags: { connect: f.tags.map((slug) => ({ id: tag[slug].id })) },
        travellerFitTags: { connect: f.travellerFit.map((slug) => ({ id: tag[slug].id })) },
        verificationStatus: "ADMIN_VERIFIED",
        isSeed: true,
      },
      update: {},
    });

    await db.festivalOccurrence.upsert({
      where: { festivalId_year: { festivalId: created.id, year: f.occurrence.year } },
      create: {
        festivalId: created.id,
        year: f.occurrence.year,
        startDate: f.occurrence.start ? new Date(f.occurrence.start) : null,
        endDate: f.occurrence.end ? new Date(f.occurrence.end) : null,
        dateConfidence: f.occurrence.confidence,
        source: "seed",
      },
      update: {},
    });

    await db.media.upsert({
      where: { id: `seed-media-festival-${f.slug}` },
      create: {
        id: `seed-media-festival-${f.slug}`,
        contentType: "FESTIVAL",
        contentId: created.id,
        url: `https://picsum.photos/seed/${f.slug}/1200/800`,
        altText: f.name,
        type: "IMAGE",
        order: 0,
      },
      update: {},
    });
  }

  // --- Destinations --------------------------------------------------------
  const destinations = [
    {
      slug: "jaisalmer-fort",
      name: "Jaisalmer Fort",
      description:
        "A living fort city rising out of the Thar Desert — narrow lanes, carved havelis, and a still-inhabited citadel of golden sandstone.",
      locationSlug: "jaisalmer",
      latitude: 26.9124,
      longitude: 70.9127,
      popularity: "POPULAR" as const,
      bestTimeStartMonth: 11,
      bestTimeEndMonth: 2,
      bestTimeExplanation: "Outside this window, desert daytime heat makes fort exploration uncomfortable.",
      budgetLevel: "MID_RANGE" as const,
      approximateCostPerDay: 3500,
      tags: ["heritage", "history", "photography"],
    },
    {
      slug: "alleppey-backwaters",
      name: "Alleppey Backwaters",
      description:
        "A network of lagoons, lakes and canals fringed by coconut palms, best explored slowly aboard a converted rice-barge houseboat.",
      locationSlug: "alleppey",
      latitude: 9.4981,
      longitude: 76.3388,
      popularity: "POPULAR" as const,
      bestTimeStartMonth: 11,
      bestTimeEndMonth: 2,
      bestTimeExplanation: "Cooler, drier weather after the monsoon; June–September brings heavy rain.",
      budgetLevel: "MID_RANGE" as const,
      approximateCostPerDay: 4000,
      tags: ["nature", "beaches", "offbeat-travel"],
    },
    {
      slug: "dzukou-valley",
      name: "Dzükou Valley",
      description:
        "A remote, trek-in-only valley on the Nagaland-Manipur border, carpeted in seasonal wildflowers and known to very few outside the Northeast.",
      locationSlug: "kohima",
      latitude: 25.5667,
      longitude: 94.05,
      popularity: "HIDDEN" as const,
      bestTimeStartMonth: 6,
      bestTimeEndMonth: 9,
      bestTimeExplanation: "The valley's namesake lilies bloom from June through September.",
      budgetLevel: "BUDGET" as const,
      approximateCostPerDay: 1500,
      tags: ["nature", "adventure", "offbeat-travel"],
    },
    {
      slug: "hampi",
      name: "Hampi",
      description:
        "The boulder-strewn ruins of the Vijayanagara Empire's capital, scattered across a surreal granite landscape on the banks of the Tungabhadra.",
      locationSlug: "hampi",
      latitude: 15.335,
      longitude: 76.46,
      popularity: "POPULAR" as const,
      bestTimeStartMonth: 10,
      bestTimeEndMonth: 2,
      bestTimeExplanation: "Avoids the extreme pre-monsoon heat common to this part of Karnataka.",
      budgetLevel: "BUDGET" as const,
      approximateCostPerDay: 1800,
      tags: ["history", "heritage", "photography"],
    },
    {
      slug: "spiti-valley",
      name: "Spiti Valley",
      description:
        "A high-altitude cold desert of Buddhist monasteries and terraced villages, cut off by snow for much of the year.",
      locationSlug: "spiti-valley",
      latitude: 32.2461,
      longitude: 78.0349,
      popularity: "HIDDEN" as const,
      bestTimeStartMonth: 6,
      bestTimeEndMonth: 9,
      bestTimeExplanation: "The only months the main road passes are reliably open.",
      budgetLevel: "MID_RANGE" as const,
      approximateCostPerDay: 3000,
      tags: ["adventure", "nature", "offbeat-travel"],
    },
  ];

  const destinationId: Record<string, string> = {};
  for (const d of destinations) {
    const created = await db.destination.upsert({
      where: { slug: d.slug },
      create: {
        slug: d.slug,
        name: d.name,
        description: d.description,
        status: "PUBLISHED",
        locationId: location[d.locationSlug].id,
        popularity: d.popularity,
        latitude: d.latitude,
        longitude: d.longitude,
        precision: "EXACT",
        bestTimeStartMonth: d.bestTimeStartMonth,
        bestTimeEndMonth: d.bestTimeEndMonth,
        bestTimeExplanation: d.bestTimeExplanation,
        bestTimeSource: "ADMIN_VERIFIED",
        budgetLevel: d.budgetLevel,
        approximateCostPerDay: d.approximateCostPerDay,
        tags: { connect: d.tags.map((slug) => ({ id: tag[slug].id })) },
        verificationStatus: "ADMIN_VERIFIED",
        isSeed: true,
      },
      update: {},
    });
    destinationId[d.slug] = created.id;

    await db.media.upsert({
      where: { id: `seed-media-destination-${d.slug}` },
      create: {
        id: `seed-media-destination-${d.slug}`,
        contentType: "DESTINATION",
        contentId: created.id,
        url: `https://picsum.photos/seed/${d.slug}/1200/800`,
        altText: d.name,
        type: "IMAGE",
        order: 0,
      },
      update: {},
    });
  }

  // --- Experiences & Food (nearby relationships) ----------------------------
  await db.experience.upsert({
    where: { slug: "desert-camel-safari" },
    create: {
      slug: "desert-camel-safari",
      name: "Desert Camel Safari",
      description: "A sunset camel ride into the dunes outside Jaisalmer, ending with an overnight desert camp.",
      category: "Adventure",
      locationId: location.jaisalmer.id,
      latitude: 26.87,
      longitude: 70.85,
      tags: { connect: [{ id: tag.adventure.id }] },
      destinations: { connect: [{ id: destinationId["jaisalmer-fort"] }] },
      isSeed: true,
    },
    update: {},
  });

  await db.experience.upsert({
    where: { slug: "backwater-houseboat-cruise" },
    create: {
      slug: "backwater-houseboat-cruise",
      name: "Backwater Houseboat Cruise",
      description: "An overnight cruise on a traditional Kettuvallam houseboat through Alleppey's backwaters.",
      category: "Nature",
      locationId: location.alleppey.id,
      latitude: 9.4981,
      longitude: 76.3388,
      tags: { connect: [{ id: tag.nature.id }] },
      destinations: { connect: [{ id: destinationId["alleppey-backwaters"] }] },
      isSeed: true,
    },
    update: {},
  });

  await db.food.upsert({
    where: { slug: "rajasthani-thali" },
    create: {
      slug: "rajasthani-thali",
      name: "Rajasthani Thali",
      description: "A multi-course vegetarian platter — dal baati churma, gatte ki sabzi, ker sangri and more.",
      region: "Rajasthan",
      locationId: location.jaisalmer.id,
      tags: { connect: [{ id: tag.food.id }] },
      destinations: { connect: [{ id: destinationId["jaisalmer-fort"] }] },
      isSeed: true,
    },
    update: {},
  });

  await db.food.upsert({
    where: { slug: "kerala-sadya" },
    create: {
      slug: "kerala-sadya",
      name: "Kerala Sadya",
      description: "A traditional banana-leaf feast of rice, sambar, avial and payasam, served at festivals and celebrations.",
      region: "Kerala",
      locationId: location.alleppey.id,
      tags: { connect: [{ id: tag.food.id }] },
      destinations: { connect: [{ id: destinationId["alleppey-backwaters"] }] },
      isSeed: true,
    },
    update: {},
  });

  // --- Event tied to a festival ---------------------------------------------
  const hornbill = await db.festival.findUniqueOrThrow({ where: { slug: "hornbill-festival" } });
  await db.event.upsert({
    where: { id: "seed-hornbill-wrestling" },
    create: {
      id: "seed-hornbill-wrestling",
      name: "Naga Wrestling Championship",
      date: new Date("2026-12-05"),
      eventType: "Sport",
      locationId: location.kohima.id,
      festivalId: hornbill.id,
      isSeed: true,
    },
    update: {},
  });

  console.log("Seed complete.");
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
