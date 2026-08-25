import { analytics } from "@/lib/analytics";

/**
 * Typed convenience wrappers around the analytics adapter for the events
 * the product spec calls out, so call sites don't hand-assemble
 * AnalyticsEventInput objects (and can't typo an event type).
 */

export function trackPageView(path: string, userId?: string) {
  return analytics.track({ type: "PAGE_VIEW", path, userId });
}

export function trackFestivalView(festivalId: string, userId?: string) {
  return analytics.track({ type: "FESTIVAL_VIEW", contentType: "FESTIVAL", contentId: festivalId, userId });
}

export function trackDestinationView(destinationId: string, userId?: string) {
  return analytics.track({ type: "DESTINATION_VIEW", contentType: "DESTINATION", contentId: destinationId, userId });
}

export function trackMapMarkerClick(contentType: "FESTIVAL" | "DESTINATION", contentId: string, userId?: string) {
  return analytics.track({ type: "MAP_MARKER_CLICK", contentType, contentId, userId });
}

export function trackMapZoom(metadata: { zoom: number }, userId?: string) {
  return analytics.track({ type: "MAP_ZOOM", metadata, userId });
}

export function trackSave(contentType: "FESTIVAL" | "DESTINATION" | "EXPERIENCE" | "FOOD", contentId: string, userId?: string) {
  return analytics.track({ type: "SAVE", contentType, contentId, userId });
}

export function trackTripCreated(tripId: string, userId?: string) {
  return analytics.track({ type: "TRIP_CREATED", contentId: tripId, userId });
}

export function trackRecommendationClick(contentType: "FESTIVAL" | "DESTINATION", contentId: string, userId?: string) {
  return analytics.track({ type: "RECOMMENDATION_CLICK", contentType, contentId, userId });
}
