import type { ContentType } from "@prisma/client";

export type DiscoveryKind = "festival" | "destination" | "experience" | "food" | "event";

export const KIND_TO_CONTENT_TYPE: Record<DiscoveryKind, ContentType> = {
  festival: "FESTIVAL",
  destination: "DESTINATION",
  experience: "EXPERIENCE",
  food: "FOOD",
  event: "EVENT",
};
