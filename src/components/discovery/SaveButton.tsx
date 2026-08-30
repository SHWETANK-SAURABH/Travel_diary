"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui";
import { useSavedState } from "./useSavedState";
import type { DiscoveryKind } from "./contentKind";

export function SaveButton({ kind, id, size = "md", source }: { kind: DiscoveryKind; id: string; size?: ButtonProps["size"]; source?: string }) {
  const { saved, toggle, error } = useSavedState(kind, id, source);

  return (
    <div className="flex flex-col items-start gap-1">
      <Button size={size} variant={saved ? "secondary" : "outline"} onClick={toggle}>
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        {saved ? "Saved" : "Save"}
      </Button>
      {error && (
        <p role="alert" className="text-label text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
