"use client";

import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGuestStore } from "@/lib/guest/store";
import { trackClientEvent } from "@/lib/analytics/client";
import { KIND_TO_CONTENT_TYPE, type DiscoveryKind } from "./contentKind";

/**
 * Save/unsave for one piece of content — guests persist to localStorage
 * (src/lib/guest/store.ts), signed-in users persist via /api/saved. One
 * hook, one call site, so every "Save" button (the map's discovery panel,
 * festival/destination detail pages) behaves identically.
 */
export function useSavedState(kind: DiscoveryKind, id: string, source?: string) {
  const { data: session } = useSession();
  const contentType = KIND_TO_CONTENT_TYPE[kind];
  const queryClient = useQueryClient();

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

  const saved = session ? Boolean(data?.saved) : guestSaved;

  async function toggle() {
    if (session) {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, contentId: id }),
      });
      const result = (await res.json()) as { saved: boolean };
      queryClient.setQueryData(queryKey, result);
    } else {
      guestToggle(contentType, id);
    }
    trackClientEvent({ type: "SAVE", contentType, contentId: id, metadata: source ? { source } : undefined });
  }

  return { saved, toggle };
}
