"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "./cn";
import { SearchInput } from "./SearchInput";

export interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
}

/**
 * Full-screen/command-palette-style search foundation — the container,
 * input, and close behavior only. Actual query execution and results wiring
 * is a later phase; `children` is where a result list (built from
 * SearchResultGroup) will render.
 */
export function SearchOverlay({
  open,
  onClose,
  value,
  onValueChange,
  onSubmit,
  placeholder = "Search festivals, destinations, cities…",
  children,
}: SearchOverlayProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "animate-scale-in top-24 mt-0 w-[min(40rem,92vw)] rounded-lg border border-border bg-paper-raised p-0 shadow-panel backdrop:bg-ink/40"
      )}
    >
      <form
        className="p-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(value);
        }}
      >
        <SearchInput
          autoFocus
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onClear={() => onValueChange("")}
        />
      </form>
      {children && <div className="max-h-[60vh] overflow-y-auto border-t border-border">{children}</div>}
    </dialog>
  );
}
