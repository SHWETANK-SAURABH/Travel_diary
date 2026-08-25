import type { AnalyticsAdapter } from "./adapter";
import { ConsoleAnalyticsProvider } from "./providers/console-provider";
import { DbAnalyticsProvider } from "./providers/db-provider";

export * from "./adapter";

function createAdapter(): AnalyticsAdapter {
  switch (process.env.ANALYTICS_PROVIDER) {
    case "console":
      return new ConsoleAnalyticsProvider();
    default:
      return new DbAnalyticsProvider();
  }
}

export const analytics = createAdapter();
