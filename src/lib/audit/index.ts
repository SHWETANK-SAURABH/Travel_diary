import type { AuditEntityType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export interface AuditLogInput {
  adminId: string;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  entityLabel?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * The admin operational trail (spec §35) — deliberately separate from
 * `src/lib/analytics` (see the schema comment on `AuditLog`): this answers
 * "what did an admin change," not product analytics, and is never sent to
 * an analytics provider. One thin `record()` call, mirroring
 * `analytics.track()`'s call-site shape, dropped into every admin service
 * function right after its mutation succeeds. Never throws — a failed
 * audit write should not roll back or block the admin's actual change.
 */
export const audit = {
  async record(input: AuditLogInput): Promise<void> {
    try {
      await db.auditLog.create({
        data: {
          adminId: input.adminId,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          entityLabel: input.entityLabel ?? null,
          metadata: input.metadata as Prisma.InputJsonValue | undefined,
        },
      });
    } catch {
      // Best-effort — see docstring.
    }
  },
};
