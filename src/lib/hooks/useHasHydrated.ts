"use client";

import { useEffect, useState } from "react";

/**
 * True only after this component's own post-mount effect has run.
 *
 * Needed alongside useGuestStore's `skipHydration` (see its docstring) —
 * that alone assumes the whole tree finishes hydrating before any effect
 * runs, which isn't guaranteed under Next.js's streaming/selective
 * hydration: a component higher in the tree (e.g. GuestStoreHydrator, near
 * the root) can have its effect fire and rehydrate the shared guest store
 * *before* a component further down (e.g. a SaveButton inside a page's
 * streamed content) has hydrated against its own server-rendered HTML,
 * producing a real mismatch (React error #418) — verified by reproducing
 * it with pre-seeded localStorage on a first-ever page load, not just a
 * reload. Gating each *consuming* component's own render on its own
 * `useHasHydrated()` sidesteps the race entirely, independent of any
 * other component's timing.
 */
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the whole point of this hook is "has an effect run yet"; there is no other trigger for that by definition.
    setHydrated(true);
  }, []);

  return hydrated;
}
