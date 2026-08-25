import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { AnalyticsAdapter, AnalyticsEventInput } from "../adapter";

/**
 * Self-hosted default provider — writes to the `AnalyticsEvent` table.
 * Fine for V1 volume; if event volume grows, swap this for a dedicated
 * analytics store/vendor without touching call sites (see adapter.ts).
 */
export class DbAnalyticsProvider implements AnalyticsAdapter {
  async track(event: AnalyticsEventInput): Promise<void> {
    await db.analyticsEvent.create({
      data: {
        type: event.type,
        userId: event.userId ?? undefined,
        path: event.path,
        contentType: event.contentType,
        contentId: event.contentId,
        metadata: event.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
