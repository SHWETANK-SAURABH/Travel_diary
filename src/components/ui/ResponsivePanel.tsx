"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

export interface ResponsivePanelProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * The map's future companion panel: a right-hand side panel on desktop, a
 * bottom sheet on mobile — one component, two layouts, per the responsive
 * foundation requirement. Not map-specific; any "content list/detail next to
 * a full-bleed canvas" screen can reuse this.
 */
export function ResponsivePanel({ open, onClose, children, className }: ResponsivePanelProps) {
  if (!open) return null;

  return (
    <>
      <button
        aria-label="Close panel"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/30 md:hidden"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed z-50 bg-paper-raised shadow-panel",
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
