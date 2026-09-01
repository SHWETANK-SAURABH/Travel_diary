"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGuestStore } from "@/lib/guest/store";
import { trackClientEvent } from "@/lib/analytics/client";
import { useHasHydrated } from "@/lib/hooks/useHasHydrated";
import { KIND_TO_CONTENT_TYPE, type DiscoveryKind } from "./contentKind";

/**
 * Save/unsave for one piece of content — guests persist to localStorage
 * (src/lib/guest/store.ts), signed-in users persist via /api/saved. One
 * hook, one call site, so every "Save" button (the map's discovery panel,
 * festival/destination detail pages, recommendation cards) behaves
 * identically. `source` is optional free-form context (e.g.
 * "recommendation") carried on the SAVE analytics event's metadata.
 *
 * Authenticated toggles are optimistic (spec §15): the UI flips immediately,
 * then syncs with the backend; a failed request reverts the flip and
 * surfaces `error` rather than leaving the UI claiming a state the server
 * never confirmed.
 */
export function useSavedState(kind: DiscoveryKind, id: string, source?: string) {
  const { data: session } = useSession();
  const contentType = KIND_TO_CONTENT_TYPE[kind];
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const hasHydrated = useHasHydrated();
  const guestSaved = useGuestStore((s) => s.isSaved(contentType, id));
  const guestToggle = useGuestStore((s) => s.toggleSaved);

  const queryKey = ["saved-state", contentType, id];
  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/saved?contentType=${contentType}&contentId=${encodeURIComponent(id)}`);
      return res.json() as Promise<{ saved: boolean }>;
    },
    enabled: !!session,
  });

  // Before this component's own hydration effect has run, `guestSaved`
  // isn't safe to render yet even though the store itself may already hold
  // real data (see useHasHydrated's docstring) — fall back to the same
  // "not saved" default the server rendered.
  const saved = session ? Boolean(data?.saved) : hasHydrated && guestSaved;

  async function toggle() {
    setError(null);
    const wasSaved = saved;

    if (session) {
      const previous = Boolean(data?.saved);
      queryClient.setQueryData(queryKey, { saved: !previous });
      try {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType, contentId: id }),
        });
        if (!res.ok) throw new Error("request failed");
        const result = (await res.json()) as { saved: boolean };
        queryClient.setQueryData(queryKey, result);
        trackClientEvent({ type: "SAVE", contentType, contentId: id, metadata: { saved: result.saved, ...(source ? { source } : {}) } });
      } catch {
        queryClient.setQueryData(queryKey, { saved: previous });
        setError("Couldn't save — try again.");
        return;
      }
    } else {
      guestToggle(contentType, id);
      trackClientEvent({ type: "SAVE", contentType, contentId: id, metadata: { saved: !wasSaved, ...(source ? { source } : {}) } });
    }
  }

  return { saved, toggle, error };
}
