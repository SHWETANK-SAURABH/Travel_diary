"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "./cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Centered dialog, built on the native <dialog> element so focus trapping,
 * ESC-to-close and backdrop semantics come from the browser instead of a
 * hand-rolled a11y implementation.
 */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
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
        "rounded-lg border border-border bg-paper-raised p-0 shadow-panel backdrop:bg-ink/40",
        "w-[min(32rem,90vw)]",
        className
      )}
    >
      {title && <h2 className="border-b border-border p-5 font-display text-h3">{title}</h2>}
      <div className="p-5">{children}</div>
    </dialog>
  );
}
