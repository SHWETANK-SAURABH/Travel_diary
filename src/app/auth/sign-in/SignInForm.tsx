"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button, Input } from "@/components/ui";
import { trackClientEvent } from "@/lib/analytics/client";

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const [email, setEmail] = useState("");

  return (
    <div className="mt-8 flex max-w-sm flex-col gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          trackClientEvent({ type: "AUTH_INTERACTION", metadata: { action: "signup_started", provider: "google" } });
          void signIn("google", { callbackUrl });
        }}
      >
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs text-ink-muted">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          trackClientEvent({ type: "AUTH_INTERACTION", metadata: { action: "signup_started", provider: "email" } });
          void signIn("nodemailer", { email, callbackUrl });
        }}
        className="flex flex-col gap-3"
      >
        <Input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit">Send me a sign-in link</Button>
      </form>
    </div>
  );
}
