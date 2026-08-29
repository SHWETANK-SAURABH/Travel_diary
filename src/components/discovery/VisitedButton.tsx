"use client";

import Link from "next/link";
import { Check, CircleCheck } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui";
import { useVisitedState } from "./useVisitedState";
import type { DiscoveryKind } from "./contentKind";

export function VisitedButton({ kind, id, size = "md" }: { kind: DiscoveryKind; id: string; size?: ButtonProps["size"] }) {
  const { visited, toggle, requiresSignIn } = useVisitedState(kind, id);

  if (requiresSignIn) {
    return (
      <Link href="/auth/sign-in">
        <Button size={size} variant="outline">
          <Check className="h-4 w-4" />
          Mark as Visited
        </Button>
      </Link>
    );
  }

  return (
    <Button size={size} variant={visited ? "secondary" : "outline"} onClick={toggle}>
      {visited ? <CircleCheck className="h-4 w-4" /> : <Check className="h-4 w-4" />}
      {visited ? "Visited" : "Mark as Visited"}
    </Button>
  );
}
