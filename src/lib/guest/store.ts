"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ContentType } from "@prisma/client";
import { computeTripDays } from "@/lib/trip/duration";
import type { GuestPreferences, GuestState, GuestTripDraft, GuestTripItemDraft } from "./types";

const GUEST_STORAGE_KEY = "traveldiary.guest.v1";

export interface CreateGuestTripInput {
  name: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  travellerCount?: number;
  estimatedBudget?: number;
}

interface GuestStore extends GuestState {
  toggleSaved(contentType: ContentType, contentId: string): void;
  isSaved(contentType: ContentType, contentId: string): boolean;
  toggleVisited(contentType: ContentType, contentId: string): void;
  isVisited(contentType: ContentType, contentId: string): boolean;
  upsertTrip(trip: GuestTripDraft): void;
  removeTrip(localId: string): void;
  createTrip(input: CreateGuestTripInput): string;
  updateTripMeta(localId: string, patch: Partial<CreateGuestTripInput>): void;
  duplicateTrip(localId: string): string | null;
  addTripItem(localId: string, item: { day: number; contentType?: ContentType; contentId?: string; notes?: string }): void;
  removeTripItem(localId: string, itemId: string): void;
  reorderTripItemsInDay(localId: string, day: number, orderedItemIds: string[]): void;
  moveTripItemToDay(localId: string, itemId: string, newDay: number): void;
  setPreferences(preferences: Omit<GuestPreferences, "updatedAt">): void;
  clear(): void;
}

function touch<T extends { updatedAt: string }>(trip: T): T {
  return { ...trip, updatedAt: new Date().toISOString() };
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

      createTrip(input) {
        const localId = crypto.randomUUID();
        const trip: GuestTripDraft = {
          localId,
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
          days: computeTripDays(input.startDate, input.endDate, input.days),
          travellerCount: input.travellerCount,
          estimatedBudget: input.estimatedBudget,
          items: [],
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ trips: [...state.trips, trip] }));
        return localId;
      },

      updateTripMeta(localId, patch) {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.localId !== localId) return t;
            const merged = { ...t, ...patch };
            return touch({ ...merged, days: computeTripDays(merged.startDate, merged.endDate, merged.days) });
          }),
        }));
      },

      duplicateTrip(localId) {
        const source = get().trips.find((t) => t.localId === localId);
        if (!source) return null;
        const newLocalId = crypto.randomUUID();
        const copy: GuestTripDraft = {
          ...source,
          localId: newLocalId,
          name: `${source.name} (Copy)`,
          items: source.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ trips: [...state.trips, copy] }));
        return newLocalId;
      },

      addTripItem(localId, item) {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.localId !== localId) return t;
            const maxOrder = t.items.filter((i) => i.day === item.day).reduce((max, i) => Math.max(max, i.order), -1);
            const newItem: GuestTripItemDraft = { id: crypto.randomUUID(), day: item.day, order: maxOrder + 1, contentType: item.contentType, contentId: item.contentId, notes: item.notes };
            return touch({ ...t, items: [...t.items, newItem] });
          }),
        }));
      },

      removeTripItem(localId, itemId) {
        set((state) => ({
          trips: state.trips.map((t) => (t.localId === localId ? touch({ ...t, items: t.items.filter((i) => i.id !== itemId) }) : t)),
        }));
      },

      reorderTripItemsInDay(localId, day, orderedItemIds) {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.localId !== localId) return t;
            const orderIndex = new Map(orderedItemIds.map((id, index) => [id, index]));
            const items = t.items.map((i) => (i.day === day && orderIndex.has(i.id) ? { ...i, order: orderIndex.get(i.id)! } : i));
            return touch({ ...t, items });
          }),
        }));
      },

      moveTripItemToDay(localId, itemId, newDay) {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.localId !== localId) return t;
            const maxOrder = t.items.filter((i) => i.day === newDay).reduce((max, i) => Math.max(max, i.order), -1);
            const items = t.items.map((i) => (i.id === itemId ? { ...i, day: newDay, order: maxOrder + 1 } : i));
            return touch({ ...t, items });
          }),
        }));
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
