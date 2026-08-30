"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackClientEvent } from "@/lib/analytics/client";
import type { AnalyticsEventInput } from "@/lib/analytics/adapter";

export interface TrackedLinkProps extends ComponentProps<typeof Link> {
  event: Omit<AnalyticsEventInput, "userId">;
}

/**
 * A plain navigational `Link` that also fires one analytics event on click —
 * for the CTAs the spec asks to track (search result clicks, calendar's
 * "festival clicked"/"map CTA clicked", explore's discovery/map/festival/
 * destination CTAs) without a client component at every call site.
 */
export function TrackedLink({ event, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackClientEvent(event);
        onClick?.(e);
      }}
    />
  );
}
