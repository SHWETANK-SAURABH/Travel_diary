import { defineConfig, devices } from "@playwright/test";

/**
 * Covers the three primary journeys spec §64 ("FINAL PRODUCT AUDIT") names
 * explicitly: Homepage→Explore→Map→Festival/Destination→Save→Trip→Share,
 * Search→Result→Content, and Admin→Edit→Publish→Public page updated.
 * Runs against a real production build + real Postgres (never mocked) —
 * see docs/testing.md for why these stay separate from the Vitest unit
 * suite in src/**\/*.test.ts.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
