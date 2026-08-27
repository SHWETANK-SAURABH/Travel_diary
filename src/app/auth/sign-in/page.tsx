import type { Metadata } from "next";
import { Container } from "@/components/layout";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = { robots: { index: false } };

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: PageProps) {
  const { callbackUrl = "/" } = await searchParams;

  return (
    <Container className="py-24">
      <h1 className="font-display text-h1">Sign in</h1>
      <p className="mt-2 max-w-sm text-ink-muted">
        Optional — browsing, saving and trip planning all work without an account. Sign in to sync
        saves and trips across devices.
      </p>
      <SignInForm callbackUrl={callbackUrl} />
    </Container>
  );
}
