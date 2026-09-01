"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "./cn";

export interface ResponsivePanelProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The map's future companion panel: a right-hand side panel on desktop, a
 * bottom sheet on mobile — one component, two layouts, per the responsive
 * foundation requirement. Not map-specific; any "content list/detail next to
 * a full-bleed canvas" screen can reuse this.
 *
 * `role="dialog" aria-modal="true"` is a promise that focus stays inside
 * while open — unlike Modal (built on native <dialog>, gets this for free),
 * this hand-rolls it: focus moves in on open, Escape closes, Tab/Shift+Tab
 * wrap at the panel's edges, and focus returns to whatever opened it on close.
 */
export function ResponsivePanel({ open, onClose, children, className }: ResponsivePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        aria-label="Close panel"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/30 md:hidden"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          "fixed z-50 bg-paper-raised shadow-panel outline-none",
          // Mobile: bottom sheet
          "inset-x-0 bottom-0 max-h-[80vh] rounded-t-lg border-t border-border",
          // Desktop: right-hand side panel
          "md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:h-full md:w-104 md:max-h-none md:rounded-none md:rounded-l-lg md:border-t-0 md:border-l",
          "overflow-y-auto",
          className
        )}
      >
        {children}
      </div>
    </>
  );
}
