import type { AnalyticsAdapter, AnalyticsEventInput } from "../adapter";

/** Dev-mode default: logs instead of shipping to a vendor. */
export class ConsoleAnalyticsProvider implements AnalyticsAdapter {
  async track(event: AnalyticsEventInput): Promise<void> {
    console.info("[analytics]", event.type, event);
  }
}
