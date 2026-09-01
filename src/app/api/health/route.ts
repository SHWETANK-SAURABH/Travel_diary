import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Lightweight liveness/readiness check (spec §37) — verifies the one piece
 * of infrastructure the app can't function without (the database) and
 * nothing else. No secrets, no internal topology, no query plans — just
 * up/down per check, suitable for an uptime monitor or load balancer probe
 * to poll without authentication.
 */
export async function GET() {
  const checks: Record<string, "healthy" | "unhealthy"> = { application: "healthy" };

  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = "healthy";
  } catch {
    checks.database = "unhealthy";
  }

  const healthy = Object.values(checks).every((status) => status === "healthy");
  return NextResponse.json({ status: healthy ? "healthy" : "unhealthy", checks, timestamp: new Date().toISOString() }, { status: healthy ? 200 : 503 });
}
