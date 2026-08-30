import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts` (same runtime, same
 * execution model — see node_modules/next/dist/docs/.../proxy.md, "Runtime:
 * Proxy defaults to using the Node.js runtime", which is what makes
 * `auth()`'s database-session lookup — a real Prisma query — usable here at
 * all; the old Edge-only Middleware runtime couldn't run Prisma).
 *
 * Gates `/admin` behind the ADMIN role, matching what
 * `src/lib/auth/config.ts` and `src/app/admin/page.tsx` already claim in
 * their comments — this file is what actually makes that claim true. Every
 * other route stays public, matching "authentication is optional" (spec
 * §2/§38): private per-user data (saves, visited, preferences) is
 * protected per-request in the API routes and page components themselves
 * (deriving identity from the session, never a client-supplied id), not by
 * a route-level redirect — /profile already renders its own signed-out
 * prompt rather than bouncing the visitor away.
 */
export default auth((req) => {
  const session = req.auth;
  if (session?.user.role === "ADMIN") return NextResponse.next();

  const signInUrl = new URL("/auth/sign-in", req.nextUrl);
  signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: ["/admin/:path*"],
};
