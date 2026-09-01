import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { AnalyticsAdapter, AnalyticsEventInput } from "../adapter";

/** Repeated renders (RSC re-render, Next.js prefetch, React Strict Mode) can fire the exact same event twice within milliseconds — this is the window that absorbs it (spec §48). Short enough to never merge two genuinely distinct actions. */
const DEDUPE_WINDOW_MS = 3000;

/**
 * Self-hosted default provider — writes to the `AnalyticsEvent` table.
 * Fine for V1 volume; if event volume grows, swap this for a dedicated
 * analytics store/vendor without touching call sites (see adapter.ts).
 */
export class DbAnalyticsProvider implements AnalyticsAdapter {
  async track(event: AnalyticsEventInput): Promise<void> {
    const identity = event.userId ? { userId: event.userId } : event.anonymousId ? { anonymousId: event.anonymousId } : {};

    const recentDuplicate = await db.analyticsEvent.findFirst({
      where: {
        type: event.type,
        path: event.path ?? null,
        contentType: event.contentType ?? null,
        contentId: event.contentId ?? null,
        createdAt: { gte: new Date(Date.now() - DEDUPE_WINDOW_MS) },
        ...identity,
      },
      select: { id: true },
    });
    if (recentDuplicate) return;

    await db.analyticsEvent.create({
      data: {
        type: event.type,
        userId: event.userId ?? undefined,
        anonymousId: event.anonymousId ?? undefined,
        path: event.path,
        contentType: event.contentType,
        contentId: event.contentId,
        metadata: event.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
