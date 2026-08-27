import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPreference } from "@/features/users/service";
import { Container } from "@/components/layout";
import { Button } from "@/components/ui";

export const metadata: Metadata = { robots: { index: false } };

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    return (
      <Container className="py-24">
        <h1 className="font-display text-h1">Profile</h1>
        <p className="mt-3 max-w-xl text-ink-muted">Sign in to view and manage your preferences.</p>
        <Link href="/auth/sign-in?callbackUrl=/profile">
          <Button className="mt-6">Sign in</Button>
        </Link>
      </Container>
    );
  }

  const preference = await getPreference(session.user.id);

  return (
    <Container className="py-12">
      <h1 className="font-display text-h1">{session.user.name ?? session.user.email}</h1>
      <p className="mt-2 text-ink-muted">
        {preference
          ? "Preferences saved. The preferences editor UI lands in a later phase."
          : "No travel preferences set yet — entirely optional."}
      </p>
    </Container>
  );
}
