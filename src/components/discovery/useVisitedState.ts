"use client";

import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trackClientEvent } from "@/lib/analytics/client";
import { KIND_TO_CONTENT_TYPE, type DiscoveryKind } from "./contentKind";

/**
 * "Mark as Visited" — a simple toggle, no dates/notes/photos (V1 per the
 * spec). Authenticated only: the Phase 1 guest-persistence architecture
 * only covers save + trips, not visited state, so a signed-out user is
 * asked to sign in rather than getting a silently-local visited flag.
 */
export function useVisitedState(kind: DiscoveryKind, id: string) {
  const { data: session } = useSession();
  const contentType = KIND_TO_CONTENT_TYPE[kind];
  const queryClient = useQueryClient();

  const queryKey = ["visited-state", contentType, id];
  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/visited?contentType=${contentType}&contentId=${encodeURIComponent(id)}`);
      return res.json() as Promise<{ visited: boolean }>;
    },
    enabled: !!session,
  });

  const visited = Boolean(data?.visited);

  async function toggle() {
    if (!session) return;
    const res = await fetch("/api/visited", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType, contentId: id }),
    });
    const result = (await res.json()) as { visited: boolean };
    queryClient.setQueryData(queryKey, result);
    trackClientEvent({ type: "MAP_INTERACTION", contentType, contentId: id, metadata: { action: "visited_toggled", visited: result.visited } });
  }

  return { visited, toggle, requiresSignIn: !session };
}
