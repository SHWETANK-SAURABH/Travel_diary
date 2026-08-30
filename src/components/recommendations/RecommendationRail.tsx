"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useGuestStore } from "@/lib/guest/store";
import { trackClientEvent } from "@/lib/analytics/client";
import { SkeletonCard } from "@/components/ui";
import { OnboardingLauncher } from "@/components/onboarding";
import { RecommendationCard } from "./RecommendationCard";
import type { InterestTagOption } from "@/components/onboarding";

interface RailItem {
  item: { id: string; slug: string; name: string; location: { name: string }; imageUrl: string | null };
  matchPercent: number | null;
  reasons: string[];
}

export interface RecommendationRailProps {
  month: number;
  interestTags: InterestTagOption[];
  /** Explore CTA copy for signed-in-with-no-preferences / guest-with-no-preferences, per mode. */
  context: string;
}

/**
 * Client-rendered deliberately — personalization is inherently
 * per-visitor/non-cacheable (spec §51/§52: "do not cache private
 * recommendations in publicly accessible caches"), so this section is the
 * one part of /explore that isn't server-rendered with the rest of the
 * page. Reads guest preferences straight from the Zustand store for
 * anonymous visitors; signed-in visitors are scored server-side against
 * their real UserPreference row (see the API route) — this component never
 * needs to know which path produced the result.
 */
export function RecommendationRail({ month, interestTags, context }: RecommendationRailProps) {
  const { data: session, status } = useSession();
  const guestPreferences = useGuestStore((s) => s.preferences);
  const [data, setData] = useState<{ recommendations: RailItem[]; personalized: boolean } | null>(null);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (status === "loading") return;
    const controller = new AbortController();
    fetch("/api/recommendations/destinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month,
        guestPreferences: session ? undefined : (guestPreferences ?? undefined),
      }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});
    return () => controller.abort();
    // Re-fetches when guest preferences change (e.g. completing onboarding
    // from this rail's own inline CTA) so results go personalized without a
    // page reload.
  }, [status, session, month, guestPreferences]);

  useEffect(() => {
    if (data && data.recommendations.length > 0 && !hasTrackedView.current) {
      hasTrackedView.current = true;
      trackClientEvent({ type: "RECOMMENDATION_VIEWED", metadata: { context, personalized: data.personalized, count: data.recommendations.length } });
    }
  }, [data, context]);

  if (!data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (data.recommendations.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-h2 font-display">{data.personalized ? "Recommended for You" : `Best This Month`}</h2>
        {!data.personalized && (
          <OnboardingLauncher
            interestTags={interestTags}
            renderTrigger={(open) => (
              <button type="button" onClick={open} className="text-caption text-marigold-600 hover:underline">
                Tell us what you&rsquo;re into →
              </button>
            )}
          />
        )}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.recommendations.map((rec) => (
          <RecommendationCard
            key={rec.item.id}
            kind="destination"
            id={rec.item.id}
            slug={rec.item.slug}
            name={rec.item.name}
            locationName={rec.item.location.name}
            imageUrl={rec.item.imageUrl}
            matchPercent={rec.matchPercent}
            reasons={rec.reasons}
            context={context}
          />
        ))}
      </div>
    </div>
  );
}
