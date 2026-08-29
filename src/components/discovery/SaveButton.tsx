"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui";
import { useSavedState } from "./useSavedState";
import type { DiscoveryKind } from "./contentKind";

export function SaveButton({ kind, id, size = "md" }: { kind: DiscoveryKind; id: string; size?: ButtonProps["size"] }) {
  const { saved, toggle } = useSavedState(kind, id);

  return (
    <Button size={size} variant={saved ? "secondary" : "outline"} onClick={toggle}>
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
