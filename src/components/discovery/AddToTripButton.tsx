"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui";
import { trackClientEvent } from "@/lib/analytics/client";

/**
 * A temporary interaction state (local component state, resets on
 * unmount/reload) — the real trip builder that would persist this as a
 * TripItem is a later phase. This is the documented integration point for
 * it: swap the body of `onClick` for a real "add item to trip" call once
 * that exists, without changing the button's API.
 */
export function AddToTripButton({ id, size = "md", source }: { id: string; size?: ButtonProps["size"]; source?: string }) {
  const [added, setAdded] = useState(false);

  return (
    <Button
      size={size}
      variant={added ? "secondary" : "outline"}
      onClick={() => {
        setAdded((v) => !v);
        trackClientEvent({ type: "ADD_TO_TRIP", contentId: id, metadata: source ? { source } : undefined });
      }}
    >
      {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      {added ? "Added" : "Add to Trip"}
    </Button>
  );
}
