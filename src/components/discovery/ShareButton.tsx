"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui";
import { trackClientEvent } from "@/lib/analytics/client";

export function ShareButton({ title, id, size = "md" }: { title: string; id: string; size?: ButtonProps["size"] }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    trackClientEvent({ type: "MAP_INTERACTION", contentId: id, metadata: { action: "share_clicked" } });

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled the native share sheet — fall through to nothing.
        return;
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button size={size} variant="ghost" onClick={handleShare}>
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Link copied" : "Share"}
    </Button>
  );
}
