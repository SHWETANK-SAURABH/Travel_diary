import type { Metadata } from "next";
import { Container } from "@/components/layout";
import { ErrorState } from "@/components/ui";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

// Auth.js's own error codes (never a raw stack trace or provider error message — spec §7/§44: "do not expose technical errors to users").
const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Couldn't start Google sign-in. Please try again.",
  OAuthCallback: "Google sign-in didn't complete. Please try again.",
  OAuthCreateAccount: "Couldn't create your account with Google. Please try again.",
  OAuthAccountNotLinked: "That email is already registered a different way — try signing in with email instead.",
  EmailCreateAccount: "Couldn't create your account. Please try again.",
  EmailSignin: "Couldn't send the sign-in link. Please check the email address and try again.",
  AccessDenied: "Sign-in was cancelled.",
  Verification: "That sign-in link has expired or was already used. Request a new one below.",
  Default: "Something went wrong signing you in. Please try again.",
};

export default async function SignInPage({ searchParams }: PageProps) {
  const { callbackUrl = "/", error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default) : null;

  return (
    <Container className="py-24">
      <h1 className="font-display text-h1">Sign in</h1>
      <p className="mt-2 max-w-sm text-ink-muted">
        Optional — browsing, saving and trip planning all work without an account. Sign in to sync
        saves and trips across devices.
      </p>
      {errorMessage && <ErrorState className="mt-4 items-start py-0 text-left" title={errorMessage} />}
      <SignInForm callbackUrl={callbackUrl} />
    </Container>
  );
}
