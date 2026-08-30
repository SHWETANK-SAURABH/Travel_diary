"use client";

import type { ReactNode } from "react";
import { trackClientEvent } from "@/lib/analytics/client";
import type { AnalyticsEventInput } from "@/lib/analytics/adapter";

/**
 * Wraps a server-rendered card (FestivalCard, DestinationCard — anything
 * whose only interactive surface is its own internal Link) with one click
 * analytics event, without needing a tracked variant of every card
 * component. Used by Calendar ("festival clicked") and Explore ("discovery
 * clicked").
 */
export function TrackedCardWrapper({ event, children }: { event: Omit<AnalyticsEventInput, "userId">; children: ReactNode }) {
  return <div onClick={() => trackClientEvent(event)}>{children}</div>;
}
