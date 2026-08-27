"use client";

import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "./cn";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}

/**
 * Minimal hand-rolled dropdown (no external menu library, per the
 * performance guidance to avoid unnecessary dependencies). Closes on
 * outside click and Escape; not a full menu-with-roving-tabindex — fine for
 * the small, mostly-link menus this app needs (Explore, account).
 */
export function Dropdown({ trigger, children, align = "start", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1"
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "animate-scale-in absolute top-full z-10 mt-2 min-w-48 origin-top rounded-md border border-border bg-paper-raised py-1 shadow-panel",
            align === "end" ? "right-0" : "left-0",
            className
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ className, ...props }: ComponentProps<"a">) {
  return (
    <a
      role="menuitem"
      className={cn("block px-3 py-2 text-sm text-ink transition-colors duration-fast hover:bg-marigold-50", className)}
      {...props}
    />
  );
}
