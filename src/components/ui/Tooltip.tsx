"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "./cn";

export interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: "top" | "bottom";
}

/** Lightweight hover/focus tooltip — no positioning library; fine for the short, static labels this app uses it for. */
export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span aria-describedby={visible ? id : undefined}>{children}</span>
      <span
        role="tooltip"
        id={id}
        className={cn(
          "animate-fade-in pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-sm bg-ink px-2 py-1 text-xs text-paper",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          visible ? "block" : "hidden"
        )}
      >
        {content}
      </span>
    </span>
  );
}
