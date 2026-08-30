import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Container } from "@/components/layout";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Route protection is enforced in src/proxy.ts (ADMIN role required,
 * everything else redirected to sign-in). This page assumes that guard has
 * already run.
 */
export default async function AdminPage() {
  const session = await auth();

  return (
    <Container className="py-12">
      <h1 className="font-display text-h1">Admin</h1>
      <p className="mt-2 text-ink-muted">
        Signed in as {session?.user.email}. The festival/destination/event/food/experience CMS,
        verification workflow and featured-content controls are Phase 2+ — see
        src/features/admin/service.ts for the guard and the first admin write path
        (verifyFestivalOccurrence).
      </p>
    </Container>
  );
}
