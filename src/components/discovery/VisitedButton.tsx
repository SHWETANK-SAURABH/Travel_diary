"use client";

import { Check, CircleCheck } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui";
import { useVisitedState } from "./useVisitedState";
import type { DiscoveryKind } from "./contentKind";

/** Works for guests (stored locally, merged into the account on sign-in) and signed-in users alike — see useVisitedState.ts. */
export function VisitedButton({ kind, id, size = "md" }: { kind: DiscoveryKind; id: string; size?: ButtonProps["size"] }) {
  const { visited, toggle, error } = useVisitedState(kind, id);

  return (
    <div className="flex flex-col items-start gap-1">
      <Button size={size} variant={visited ? "secondary" : "outline"} onClick={toggle}>
        {visited ? <CircleCheck className="h-4 w-4" /> : <Check className="h-4 w-4" />}
        {visited ? "Visited" : "Mark as Visited"}
      </Button>
      {error && (
        <p role="alert" className="text-label text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
