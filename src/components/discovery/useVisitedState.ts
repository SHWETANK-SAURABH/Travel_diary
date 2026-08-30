"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGuestStore } from "@/lib/guest/store";
import { trackClientEvent } from "@/lib/analytics/client";
import { useHasHydrated } from "@/lib/hooks/useHasHydrated";
import { KIND_TO_CONTENT_TYPE, type DiscoveryKind } from "./contentKind";

/**
 * "Mark as Visited" — a simple toggle, no dates/notes/photos (V1 per the
 * spec). Mirrors useSavedState.ts exactly: guests persist locally
 * (src/lib/guest/store.ts, merged into the account on sign-in — see
 * src/lib/guest/merge.ts), signed-in users persist via /api/visited with
 * an optimistic update + rollback-on-failure.
 */
export function useVisitedState(kind: DiscoveryKind, id: string) {
  const { data: session } = useSession();
  const contentType = KIND_TO_CONTENT_TYPE[kind];
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const hasHydrated = useHasHydrated();
  const guestVisited = useGuestStore((s) => s.isVisited(contentType, id));
  const guestToggle = useGuestStore((s) => s.toggleVisited);

  const queryKey = ["visited-state", contentType, id];
  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/visited?contentType=${contentType}&contentId=${encodeURIComponent(id)}`);
      return res.json() as Promise<{ visited: boolean }>;
    },
    enabled: !!session,
  });

  // See useSavedState.ts's identical comment — not safe to trust guestVisited
  // until this component's own hydration effect has run.
  const visited = session ? Boolean(data?.visited) : hasHydrated && guestVisited;

  async function toggle() {
    setError(null);

    if (session) {
      const previous = Boolean(data?.visited);
      queryClient.setQueryData(queryKey, { visited: !previous });
      try {
        const res = await fetch("/api/visited", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType, contentId: id }),
        });
        if (!res.ok) throw new Error("request failed");
        const result = (await res.json()) as { visited: boolean };
        queryClient.setQueryData(queryKey, result);
        trackClientEvent({ type: "VISITED", contentType, contentId: id, metadata: { visited: result.visited } });
      } catch {
        queryClient.setQueryData(queryKey, { visited: previous });
        setError("Couldn't update — try again.");
      }
      return;
    }

    guestToggle(contentType, id);
    trackClientEvent({ type: "VISITED", contentType, contentId: id, metadata: { visited: !guestVisited } });
  }

  return { visited, toggle, error };
}
