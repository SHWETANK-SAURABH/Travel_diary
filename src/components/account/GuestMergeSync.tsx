"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useGuestStore } from "@/lib/guest/store";
import { trackClientEvent } from "@/lib/analytics/client";
import { getAnonymousId } from "@/lib/analytics/anonymous-id";
import type { GuestState } from "@/lib/guest/types";

function hasGuestContent(state: GuestState): boolean {
  return state.savedItems.length > 0 || state.visitedItems.length > 0 || state.trips.length > 0 || state.preferences !== null;
}

/** Module-level (not a component closure) so it's stable across renders and can't accidentally capture stale state — it only ever operates on the `state` snapshot it's given. */
function mergeGuestState(state: GuestState & { clear: () => void }, onFailure: () => void) {
  const snapshot = {
    savedItems: state.savedItems,
    visitedItems: state.visitedItems,
    trips: state.trips,
    preferences: state.preferences,
    analyticsAnonymousId: getAnonymousId() ?? undefined,
  };

  return fetch("/api/guest/merge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot),
  })
    .then((res) => {
      if (!res.ok) throw new Error("merge failed");
      state.clear();
      trackClientEvent({
        type: "GUEST_MERGE",
        metadata: {
          savedCount: snapshot.savedItems.length,
          visitedCount: snapshot.visitedItems.length,
          tripCount: snapshot.trips.length,
          hadPreferences: snapshot.preferences !== null,
        },
      });
    })
    .catch(onFailure);
}

/**
 * The guest → account transition (spec §21: "the most important part of
 * the phase"). Mounted once in the provider tree so it runs on every page
 * load; fires automatically the moment a session becomes authenticated,
 * with no user action required — "a guest should never feel that creating
 * an account means starting over."
 *
 * Local guest state is only cleared *after* the server confirms the merge
 * succeeded (spec §24: "do not delete local data before the server
 * confirms successful merge") — a failed request leaves everything as-is,
 * and a later mount (e.g. a page reload) will simply try again, since
 * `attempted` is component-local and the guest data it's guarding is still
 * there to retry with.
 */
export function GuestMergeSync() {
  const { status } = useSession();
  const attempted = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || attempted.current) return;

    // Awaits rehydration explicitly (rather than relying on
    // GuestStoreHydrator having already run first) so this is correct
    // regardless of provider mount order — `rehydrate()` is idempotent, so
    // a redundant call here is harmless.
    void (async () => {
      await useGuestStore.persist.rehydrate();
      const state = useGuestStore.getState();
      if (!hasGuestContent(state) || attempted.current) return;
      attempted.current = true;
      await mergeGuestState(state, () => {
        attempted.current = false;
      });
    })();
  }, [status]);

  return null;
}
