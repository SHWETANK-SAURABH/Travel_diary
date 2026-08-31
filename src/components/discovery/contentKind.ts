import type { ContentType } from "@prisma/client";

export type DiscoveryKind = "festival" | "destination" | "experience" | "food" | "event";

export const KIND_TO_CONTENT_TYPE: Record<DiscoveryKind, ContentType> = {
  festival: "FESTIVAL",
  destination: "DESTINATION",
  experience: "EXPERIENCE",
  food: "FOOD",
  event: "EVENT",
};

export const CONTENT_TYPE_TO_KIND: Record<ContentType, DiscoveryKind> = {
  FESTIVAL: "festival",
  DESTINATION: "destination",
  EXPERIENCE: "experience",
  FOOD: "food",
  EVENT: "event",
};

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  FESTIVAL: "Festival",
  DESTINATION: "Destination",
  EXPERIENCE: "Experience",
  FOOD: "Food",
  EVENT: "Event",
};
