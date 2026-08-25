import type { AnalyticsEventType, ContentType } from "@prisma/client";

export interface AnalyticsEventInput {
  type: AnalyticsEventType;
  userId?: string | null;
  path?: string;
  contentType?: ContentType;
  contentId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Provider-agnostic analytics sink. The rest of the app calls `track()` and
 * never imports a specific vendor SDK, so swapping/adding providers
 * (PostHog, Plausible, ...) later touches only this folder.
 */
export interface AnalyticsAdapter {
  track(event: AnalyticsEventInput): Promise<void>;
}
