"use client";

import type { AnalyticsEventInput } from "./adapter";

/**
 * Client-side analytics call site — POSTs to /api/analytics/track rather
 * than importing the adapter directly (which pulls in Prisma and can't run
 * in the browser). Fire-and-forget: a dropped analytics event should never
 * break the UI interaction that triggered it.
 */
export function trackClientEvent(event: Omit<AnalyticsEventInput, "userId">) {
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => {
    // Best-effort — never surface analytics failures to the user.
  });
}
