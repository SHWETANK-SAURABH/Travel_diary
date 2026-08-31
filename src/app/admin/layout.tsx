import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// Hoisted here so every /admin/* route inherits it — spec §48: "all admin
// routes must be protected, noindex, unavailable to anonymous users."
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * A second, independent authorization check (spec §4's "every admin
 * API/server action must independently verify," not just `src/proxy.ts`'s
 * route-level gate) — defense in depth, not redundancy: this is what keeps
 * every admin page correctly gated even if the proxy matcher were ever
 * mis-scoped. Intentionally utilitarian chrome (a plain sidebar, no hero,
 * no marketing components) per spec §42 — the surrounding public
 * Header/Footer still render (this app has one shared root layout; see
 * docs/architecture.md for why splitting that apart was out of scope this
 * phase), but everything inside this boundary reads as an internal tool.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect(`/auth/sign-in?callbackUrl=${encodeURIComponent("/admin")}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <AdminSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
