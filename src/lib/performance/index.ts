import { db } from "@/lib/db";

/**
 * Times a named operation and logs its duration (spec §33–§36: map
 * viewport/search/recommendation/nearby/trip query latency). Deliberately
 * unconditional (every call, not just slow ones) rather than sampled —
 * V1 traffic here is low enough that a `PerformanceLog` row per call is
 * cheap, and a fixed retention window (docs/analytics.md) keeps the table
 * bounded. Never swallows the wrapped function's own result or error; a
 * failed timing write must never mask (or cause) a real failure in the
 * operation being measured.
 */
export async function measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  let failed = false;
  try {
    return await fn();
  } catch (error) {
    failed = true;
    throw error;
  } finally {
    const durationMs = Math.round(performance.now() - start);
    db.performanceLog.create({ data: { operation, durationMs, failed } }).catch(() => {
      // Best-effort — see docstring.
    });
  }
}
