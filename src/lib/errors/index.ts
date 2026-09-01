import type { ErrorSeverity, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export interface CaptureErrorInput {
  message: string;
  stack?: string;
  path?: string;
  severity?: ErrorSeverity;
  metadata?: Record<string, unknown>;
}

/**
 * A deliberately minimal error-tracking sink (spec §31/§32) — not a
 * log-aggregation platform, no external SDK (no vendor credentials exist in
 * this environment; see docs/architecture.md for the same reasoning applied
 * to Media storage in Phase 10). Captures exceptions/route failures only;
 * never passwords, tokens, or private trip/user content — callers pass a
 * message/stack/path, not raw request bodies. Console-logs unconditionally
 * (so a local dev session still sees it) and never throws itself — an error
 * tracker that crashes the thing it's tracking would be worse than silence.
 */
export async function captureError(input: CaptureErrorInput): Promise<void> {
  console.error("[error]", input.severity ?? "ERROR", input.message, input.path ?? "");
  try {
    await db.errorLog.create({
      data: {
        message: input.message.slice(0, 2000),
        stack: input.stack?.slice(0, 8000),
        path: input.path,
        severity: input.severity ?? "ERROR",
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    // Best-effort — see docstring.
  }
}
