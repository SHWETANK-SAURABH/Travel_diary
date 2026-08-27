"use client";

import type { ReactNode } from "react";
import { FullScreenSection } from "@/components/layout/Container";
import { ResponsivePanel } from "@/components/ui";

export interface MapShellProps {
  /** The map canvas itself — a real map library mounts here in a later phase. */
  children: ReactNode;
  /** Search / month selector / layer toggles row, above the map. */
  controls?: ReactNode;
  panelOpen: boolean;
  onPanelClose: () => void;
  panelContent?: ReactNode;
}

/**
 * The map page's application shell: full-viewport canvas area with a
 * controls row above it, and the side-panel-on-desktop /
 * bottom-sheet-on-mobile companion panel — everything the map needs to
 * plug into except the actual map. See docs/phase.md "MAP-READY DESIGN" for
 * the wireframes this mirrors, and src/components/map/README.md for what
 * plugs in here next.
 */
export function MapShell({ children, controls, panelOpen, onPanelClose, panelContent }: MapShellProps) {
  return (
    <FullScreenSection className="relative flex flex-col">
      {controls && <div className="border-b border-border bg-paper-raised px-4 py-2">{controls}</div>}

      <div className="relative flex-1">
        {children}

        <ResponsivePanel open={panelOpen} onClose={onPanelClose}>
          {panelContent}
        </ResponsivePanel>
      </div>
    </FullScreenSection>
  );
}
