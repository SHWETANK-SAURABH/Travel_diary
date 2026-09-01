"use client";

const KEY = "traveldiary.anon_id";

/**
 * The only identity a signed-out visitor carries (spec §6) — a random UUID,
 * generated once and persisted in localStorage next to the guest save/trip
 * state this app already keeps there, not a fingerprint or device id, and
 * clearable by the visitor at any time. Client-only by construction: a
 * Server Component can't write localStorage, so server-fired events
 * (`trackPageView`, `trackFestivalView`, ...) simply don't carry one — a
 * known, documented gap (see docs/analytics.md) rather than a reason to
 * route anonymous identity through cookies/middleware for this phase.
 */
export function getAnonymousId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null; // localStorage unavailable (private mode, storage disabled, ...) — fail open, not fatal.
  }
}
