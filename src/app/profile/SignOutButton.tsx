"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui";
import { trackClientEvent } from "@/lib/analytics/client";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        trackClientEvent({ type: "AUTH_INTERACTION", metadata: { action: "logout" } });
        void signOut();
      }}
    >
      Sign out
    </Button>
  );
}
