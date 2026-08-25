import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

/**
 * Single shared Prisma client. Reused across hot reloads in dev so we don't
 * exhaust the Postgres connection pool every time Next.js recompiles a route.
 */
export const db = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}
