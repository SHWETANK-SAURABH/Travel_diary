"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "lucide-react";
import { Dropdown, DropdownItem, Button } from "@/components/ui";
import { trackClientEvent } from "@/lib/analytics/client";

export function AccountMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-9 rounded-full bg-border/40" />;
  }

  if (!session) {
    return (
      <Link href="/auth/sign-in">
        <Button size="sm" variant="outline">
          Sign in
        </Button>
      </Link>
    );
  }

  return (
    <Dropdown
      align="end"
      trigger={
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-marigold-50 text-marigold-600">
          <User className="h-4 w-4" aria-hidden="true" />
        </span>
      }
    >
      <DropdownItem href="/profile">Profile</DropdownItem>
      <DropdownItem href="/trips">Trips</DropdownItem>
      {session.user.role === "ADMIN" && <DropdownItem href="/admin">Admin</DropdownItem>}
      <button
        type="button"
        onClick={() => {
          trackClientEvent({ type: "AUTH_INTERACTION", metadata: { action: "logout" } });
          void signOut();
        }}
        className="block w-full px-3 py-2 text-left text-sm text-ink transition-colors duration-fast hover:bg-marigold-50"
      >
        Sign out
      </button>
    </Dropdown>
  );
}
