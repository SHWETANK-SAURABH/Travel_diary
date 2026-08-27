import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Route protection foundation. Everything is public by default (browsing
 * never requires an account); only /admin is gated, and gated on role, not
 * just "is signed in".
 */
export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  if (!isAdminRoute) return NextResponse.next();

  const role = req.auth?.user?.role;
  if (role !== "ADMIN") {
    const signInUrl = new URL("/auth/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
