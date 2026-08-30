"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ContentType } from "@prisma/client";
import type { GuestPreferences, GuestState, GuestTripDraft } from "./types";

const GUEST_STORAGE_KEY = "traveldiary.guest.v1";

interface GuestStore extends GuestState {
  toggleSaved(contentType: ContentType, contentId: string): void;
  isSaved(contentType: ContentType, contentId: string): boolean;
  toggleVisited(contentType: ContentType, contentId: string): void;
  isVisited(contentType: ContentType, contentId: string): boolean;
  upsertTrip(trip: GuestTripDraft): void;
  removeTrip(localId: string): void;
  setPreferences(preferences: Omit<GuestPreferences, "updatedAt">): void;
  clear(): void;
}

/**
 * Guest (no-account) persistence, entirely client-side via localStorage.
 * This is the local half of the "local guest state" / "account state" split
 * from the state-management architecture — see src/lib/guest/merge.ts for
 * how it's reconciled into the database once the guest signs in.
 *
 * `skipHydration: true` + the explicit rehydrate in
 * `src/components/account/GuestStoreHydrator.tsx` fixes a real hydration
 * bug: without it, Zustand's `persist` reads localStorage synchronously
 * while the *store* is created on the client, so a page reload after
 * saving something as a guest could produce a first client render that
 * already reflects "saved" while the server-rendered HTML (which has no
 * access to localStorage) says "not saved" — a genuine React hydration
 * mismatch (error #418), not just a cosmetic flicker. Skipping automatic
 * hydration keeps the store's first client render at the same default the
 * server used; `GuestStoreHydrator` then rehydrates in an effect, after
 * hydration has already reconciled, so any UI update is a normal
 * post-mount re-render instead of a mismatch.
 */
export const useGuestStore = create<GuestStore>()(
  persist(
    (set, get) => ({
      savedItems: [],
      visitedItems: [],
      trips: [],
      preferences: null,

      toggleSaved(contentType, contentId) {
        const exists = get().isSaved(contentType, contentId);
        set((state) => ({
          savedItems: exists
            ? state.savedItems.filter(
                (item) => !(item.contentType === contentType && item.contentId === contentId)
              )
            : [...state.savedItems, { contentType, contentId, savedAt: new Date().toISOString() }],
        }));
      },

      isSaved(contentType, contentId) {
        return get().savedItems.some(
          (item) => item.contentType === contentType && item.contentId === contentId
        );
      },

      toggleVisited(contentType, contentId) {
        const exists = get().isVisited(contentType, contentId);
        set((state) => ({
          visitedItems: exists
            ? state.visitedItems.filter(
                (item) => !(item.contentType === contentType && item.contentId === contentId)
              )
            : [...state.visitedItems, { contentType, contentId, visitedAt: new Date().toISOString() }],
        }));
      },

      isVisited(contentType, contentId) {
        return get().visitedItems.some(
          (item) => item.contentType === contentType && item.contentId === contentId
        );
      },

      upsertTrip(trip) {
        set((state) => ({
          trips: [...state.trips.filter((t) => t.localId !== trip.localId), trip],
        }));
      },

      removeTrip(localId) {
        set((state) => ({ trips: state.trips.filter((t) => t.localId !== localId) }));
      },

      setPreferences(preferences) {
        set({ preferences: { ...preferences, updatedAt: new Date().toISOString() } });
      },

      clear() {
        set({ savedItems: [], visitedItems: [], trips: [], preferences: null });
      },
    }),
    { name: GUEST_STORAGE_KEY, skipHydration: true }
  )
);
