import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import type { BrowserContext } from "@playwright/test";

const db = new PrismaClient();

/** Idempotent so re-runs (and parallel spec files) never collide — upserts by the fixture's own dedicated email rather than reusing accounts from manual testing. */
export async function ensureUser(email: string, role: "USER" | "ADMIN"): Promise<{ id: string }> {
  return db.user.upsert({
    where: { email },
    create: { email, name: `E2E ${role === "ADMIN" ? "Admin" : "User"} Fixture`, role, emailVerified: new Date() },
    update: { role },
    select: { id: true },
  });
}

/**
 * Auth.js v5 with `session: { strategy: "database" }` (src/lib/auth/config.ts)
 * looks up the session by the cookie's raw value against `Session.sessionToken`
 * — there's no OAuth flow to automate here, so E2E tests authenticate by
 * writing that row directly and handing Playwright the cookie, the same way
 * a real sign-in would leave the browser once the redirect completed.
 * Cookie name/security-prefix logic matches @auth/core's `defaultCookies`
 * (unprefixed `authjs.session-token` because AUTH_URL is http://localhost).
 */
export async function signInAs(context: BrowserContext, email: string): Promise<void> {
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60);

  await db.session.create({ data: { sessionToken, userId: user.id, expires } });

  await context.addCookies([
    {
      name: "authjs.session-token",
      value: sessionToken,
      domain: "localhost",
      path: "/",
      expires: Math.floor(expires.getTime() / 1000),
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}

export async function closeSessionDb(): Promise<void> {
  await db.$disconnect();
}

export { db };
