"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ContentType } from "@prisma/client";
import type { GuestState, GuestTripDraft } from "./types";

const GUEST_STORAGE_KEY = "traveldiary.guest.v1";

interface GuestStore extends GuestState {
  toggleSaved(contentType: ContentType, contentId: string): void;
  isSaved(contentType: ContentType, contentId: string): boolean;
  upsertTrip(trip: GuestTripDraft): void;
  removeTrip(localId: string): void;
  clear(): void;
}

/**
 * Guest (no-account) persistence, entirely client-side via localStorage.
 * This is the local half of the "local guest state" / "account state" split
 * from the state-management architecture — see src/lib/guest/merge.ts for
 * how it's reconciled into the database once the guest signs in.
 */
export const useGuestStore = create<GuestStore>()(
  persist(
    (set, get) => ({
      savedItems: [],
      trips: [],

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

      upsertTrip(trip) {
        set((state) => ({
          trips: [...state.trips.filter((t) => t.localId !== trip.localId), trip],
        }));
      },

      removeTrip(localId) {
        set((state) => ({ trips: state.trips.filter((t) => t.localId !== localId) }));
      },

      clear() {
        set({ savedItems: [], trips: [] });
      },
    }),
    { name: GUEST_STORAGE_KEY }
  )
);
