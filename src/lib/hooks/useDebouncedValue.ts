"use client";

import { useEffect, useState } from "react";

/**
 * Debounces a fast-changing value (typically a search input) by `delayMs`.
 * Extracted from the map search box's inline debounce timer now that the
 * universal search overlay needs the same behavior — a second real
 * consumer, not a preemptive abstraction.
 */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
