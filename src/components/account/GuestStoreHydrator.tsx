"use client";

import { useEffect } from "react";
import { useGuestStore } from "@/lib/guest/store";

/**
 * Rehydrates the guest store from localStorage once, after mount — see the
 * `skipHydration` comment on useGuestStore for why this can't just happen
 * automatically at store-creation time. Renders nothing; every component
 * reading guest state (SaveButton, VisitedButton, the recommendation rail,
 * ...) picks up the rehydrated values reactively once this resolves.
 */
export function GuestStoreHydrator() {
  useEffect(() => {
    void useGuestStore.persist.rehydrate();
  }, []);

  return null;
}
