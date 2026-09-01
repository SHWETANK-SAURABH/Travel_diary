import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Unit tests only — pure logic with no database/network, per spec §49
 * ("unit tests: date/status logic, recommendation scoring, explanation
 * generation, budget calculations, seasonal ranking, query normalization").
 * Integration/API/E2E coverage lives in tests/e2e (Playwright) instead,
 * since those genuinely need a running server + database — see
 * docs/testing.md for why the split, and how each suite runs.
 */
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
